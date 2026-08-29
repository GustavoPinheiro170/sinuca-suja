/* ══ REDE ══ */
/* Multiplayer por WebRTC (PeerJS), sem servidor de jogo.
   O truque: sinuca é por turnos e a simulação é determinística, então em vez
   de transmitir a posição das bolas eu mando UMA mensagem por jogada — direção,
   força e objeto. Os dois lados simulam igual e ficam sincronizados sozinhos.
   O código da sala vira a semente do sorteio, então nem isso precisa trafegar. */
var Rede=(function(){
  var peer=null,conn=null,papel=null,sala=null,estado="off",
      tentativa=0,timerRec=null,aoAbrir=null,aoStatus=null;
  var ALFA="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   /* sem O/0/I/1 */

  function novoCodigo(){
    var c="";for(var i=0;i<5;i++)c+=ALFA[Math.floor(Math.random()*ALFA.length)];
    return c;
  }
  function idDe(c){return "sinucasuja-v1-"+c;}
  function sementeDe(c){                          /* código → semente compartilhada */
    var h=2166136261;
    for(var i=0;i<c.length;i++){h^=c.charCodeAt(i);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function status(e,extra){
    estado=e;
    if(aoStatus)aoStatus(e,extra);
  }
  function temPeerJS(){return typeof Peer!=="undefined";}

  function abrirPeer(id,cb){
    if(!temPeerJS()){status("erro","PeerJS não carregou");return;}
    /* window.PEER_CFG permite apontar para um servidor de sinalização próprio;
       sem ele usa o broker público do PeerJS, que é gratuito. */
    var cfg=Object.assign({debug:0},window.PEER_CFG||{});
    try{peer=id?new Peer(id,cfg):new Peer(cfg);}catch(e){status("erro",String(e));return;}
    peer.on("open",function(){cb&&cb();});
    peer.on("error",function(err){
      var t=String(err&&err.type||err);
      if(t==="unavailable-id")status("erro","essa sala já existe, tente outro código");
      else if(t==="peer-unavailable")status("erro","sala não encontrada");
      else if(t==="network"||t==="server-error"||t==="socket-error")agendarRec();
      else status("erro",t);
    });
    peer.on("disconnected",function(){ if(estado!=="off")agendarRec(); });
  }
  function armar(c){
    conn=c;
    conn.on("open",function(){
      tentativa=0;
      status("ligado");
      if(papel==="anfitriao"&&aoAbrir)aoAbrir();
    });
    conn.on("data",function(m){ receber(m); });
    conn.on("close",function(){ if(estado!=="off"){status("caiu");agendarRec();} });
    conn.on("error",function(){ if(estado!=="off")agendarRec(); });
  }
  /* ── reconexão ── */
  function agendarRec(){
    if(estado==="off"||timerRec)return;
    status("reconectando",++tentativa);
    var espera=Math.min(8000,1200*tentativa);
    timerRec=setTimeout(function(){
      timerRec=null;
      if(estado==="off")return;
      try{
        if(peer&&peer.disconnected&&!peer.destroyed)peer.reconnect();
      }catch(e){}
      if(papel==="convidado"&&peer&&!peer.destroyed){
        try{armar(peer.connect(idDe(sala),{reliable:true}));}catch(e){}
      }
      if(estado!=="ligado")agendarRec();
    },espera);
  }

  function criar(cb,cbStatus){
    papel="anfitriao";sala=novoCodigo();aoAbrir=cb;aoStatus=cbStatus;
    salvar();
    status("abrindo");
    abrirPeer(idDe(sala),function(){status("esperando");});
    peer.on("connection",function(c){
      if(conn&&conn.open){try{c.close();}catch(e){}return;}   /* sala cheia */
      armar(c);
      c.on("open",function(){
        c.send({t:"inicio",semente:sementeDe(sala),sala:sala});
      });
    });
    return sala;
  }
  function entrar(c,cb,cbStatus){
    papel="convidado";sala=(c||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
    aoAbrir=cb;aoStatus=cbStatus;
    if(sala.length<4){status("erro","código curto demais");return null;}
    salvar();
    status("abrindo");
    abrirPeer(null,function(){
      status("conectando");
      armar(peer.connect(idDe(sala),{reliable:true}));
    });
    return sala;
  }
  function sair(){
    status("off");
    if(timerRec){clearTimeout(timerRec);timerRec=null;}
    try{if(conn)conn.close();}catch(e){}
    try{if(peer)peer.destroy();}catch(e){}
    conn=null;peer=null;papel=null;sala=null;tentativa=0;
    try{localStorage.removeItem("sinuca.sala");}catch(e){}
  }
  function salvar(){
    try{localStorage.setItem("sinuca.sala",JSON.stringify({sala:sala,papel:papel,q:Date.now()}));}catch(e){}
  }
  function retomar(){                              /* sala guardada de antes */
    try{
      var v=JSON.parse(localStorage.getItem("sinuca.sala")||"null");
      if(v&&Date.now()-v.q<1000*60*60)return v;
    }catch(e){}
    return null;
  }
  function enviar(m){
    if(conn&&conn.open){try{conn.send(m);}catch(e){}}
  }
  return {criar:criar,entrar:entrar,sair:sair,enviar:enviar,retomar:retomar,
          semente:sementeDe,estado:function(){return estado;},
          sala:function(){return sala;},papel:function(){return papel;},
          ligado:function(){return !!(conn&&conn.open);}};
})();

/* ── aplica o que chega do outro lado ── */
function receber(m){
  if(!m||!m.t)return;
  if(m.t==="inicio"){ iniciarOnline(m.semente); return; }
  if(!G)return;
  if(m.t==="taco"){
    var o=OBJECTS.filter(function(x){return x.id===m.obj;})[0];
    if(o){equipFoe(o);sync();}
    return;
  }
  if(m.t==="tacada"){
    /* equipa SEMPRE: a potência do objeto entra no cálculo da tacada, e um
       guarda aqui fazia o convidado simular com outro taco — as duas mesas
       divergiam 9% na distância percorrida. */
    var ob=OBJECTS.filter(function(x){return x.id===m.obj;})[0];
    if(ob)equipFoe(ob);
    G.turn="foe"; G.phase="aim";
    shoot({x:m.dx,z:m.dz},m.p,"foe",
      (typeof m.vx==="number")?{vx:m.vx,vz:m.vz}:null);
    return;
  }
  if(m.t==="arremesso"){
    var j=junkPool[m.j];
    if(j)hurl(j,m.x,0.075,m.z,m.sem);
    return;
  }
  if(m.t==="retirar"){
    var r=junkPool[m.j];
    if(r){
      /* o ângulo vem na mensagem: antes quem tirava sorteava um rnd() que o
         outro lado não gastava, e os dois fluxos saíam de passo */
      recolher(r,(typeof m.a==="number")?m.a:rnd()*TAU);
      G.turn="you";G.phase="aim";sync();
      toast("Ele tirou "+r.t.nome.toLowerCase(),"perdeu a vez dele","good");
    }
    return;
  }
  if(m.t==="estado"){
    /* Não corta a rolagem no meio: guarda e encaixa quando as bolas param. */
    if(m.auto&&G.phase==="roll"){ snapPend=m.s; return; }
    aplicarSnap(m.s,!!m.auto); return;
  }
  if(m.t==="pedeEstado"){ Rede.enviar({t:"estado",s:tirarSnap()}); return; }
}
/* ── sincronização depois de uma queda ── */
var snapPend=null;
function tirarSnap(){
  return {sem:_sem,turn:G.turn,phase:G.phase,group:G.group,foeGroup:G.foeGroup,
    over:G.over?1:0,winner:G.winner,
    shots:G.shots,thr:G.throwsLeft,
    b:G.balls.map(function(b){return [b.x,b.z,b.live?1:0,b.num];}),
    j:junkPool.map(function(o){return [o.x,o.y,o.z,o.q.x,o.q.y,o.q.z,o.q.w,
      o.state,o.onTable?1:0];})};
}
function aplicarSnap(s,quieto){
  if(!s||!G)return;
  _sem=s.sem;
  /* o snapshot vem do anfitrião, cujo "you" é o meu "foe" */
  G.turn=(s.turn==="you")?"foe":"you";
  G.phase=(s.phase==="roll")?"roll":(G.turn==="you"?"aim":"aguardando");
  G.group=s.foeGroup; G.foeGroup=s.group;
  G.shots=s.shots;
  s.b.forEach(function(v,i){ var b=G.balls[i]; if(!b)return;
    b.x=v[0];b.z=v[1];b.live=!!v[2];b.num=v[3];b.vx=0;b.vz=0; });
  s.j.forEach(function(v,i){ var o=junkPool[i]; if(!o)return;
    /* tralha na mão (minha ou dele) não entra no encaixe: a jogada dela ainda
       nem aconteceu, e o arremesso chega na mensagem própria */
    if(o.state==="held"||v[7]==="held")return;
    o.x=v[0];o.y=v[1];o.z=v[2];
    o.q.set(v[3],v[4],v[5],v[6]);
    o.state=(v[7]==="fly")?"rest":v[7];
    o.onTable=!!v[8];o.vx=0;o.vy=0;o.vz=0;o.av.set(0,0,0);
    if(o.state==="rest"&&!o.onTable)o.y=FLOOR+restY(o);
    o.g.position.set(o.x,o.y,o.z);o.g.quaternion.copy(o.q); });
  if(s.over){
    G.over=true;G.phase="over";
    G.winner=(s.winner==="you")?"foe":"you";
    ui({over:true,winner:G.winner,shots:G.shots,group:G.group});
    return;
  }
  G.over=false;
  sync();
  if(!quieto)toast("Sincronizado","a partida continua","good");
}
function iniciarOnline(semente){
  semear(semente);
  G=newGame(); G.modo="online";
  equip(OBJECTS[0]); equipFoe(OBJECTS[2]);
  /* anfitrião começa; convidado espera */
  var souAnfitriao=(Rede.papel()==="anfitriao");
  G.turn=souAnfitriao?"you":"foe";
  G.phase=souAnfitriao?"aim":"aguardando";
  if(setUI)setUI(function(o){return Object.assign({},o,{started:true,over:false,
    modo:"online",sala:Rede.sala(),rede:"ligado"});});
  sync();
  toast(souAnfitriao?"Você quebra":"Ele quebra","partida conectada","good");
}
