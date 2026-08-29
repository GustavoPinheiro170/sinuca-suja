/* ══ FÍSICA ══ */
function stepBalls(dt){
  var B=G.balls,i,j;
  for(i=0;i<B.length;i++){
    var b=B[i];if(!b.live)continue;
    var sp=Math.hypot(b.vx,b.vz);
    if(sp>0){var dc=MU*dt;if(dc>=sp){b.vx=0;b.vz=0;}else{b.vx-=b.vx/sp*dc;b.vz-=b.vz/sp*dc;}}
    b.x+=b.vx*dt;b.z+=b.vz*dt;}
  for(i=0;i<junkPool.length;i++){
    var o=junkPool[i];if(!o.onTable||o.state!=="rest")continue;
    var s2=Math.hypot(o.vx,o.vz);
    if(s2>0){var d2=MU*2.4*dt;if(d2>=s2){o.vx=0;o.vz=0;}else{o.vx-=o.vx/s2*d2;o.vz-=o.vz/s2*d2;}}
    o.x+=o.vx*dt;o.z+=o.vz*dt;
    if(o.x<-HW+o.r){o.x=-HW+o.r;o.vx*=-0.35;} if(o.x>HW-o.r){o.x=HW-o.r;o.vx*=-0.35;}
    if(o.z<-HL+o.r){o.z=-HL+o.r;o.vz*=-0.35;} if(o.z>HL-o.r){o.z=HL-o.r;o.vz*=-0.35;}}
  for(i=0;i<B.length;i++){
    var a=B[i];if(!a.live)continue;
    for(j=i+1;j<B.length;j++){
      var c=B[j];if(!c.live)continue;
      var dx=c.x-a.x,dz=c.z-a.z,dd=Math.hypot(dx,dz);
      if(dd>0&&dd<a.r+c.r){
        var nx=dx/dd,nz=dz/dd,ov=(a.r+c.r-dd)/2;
        a.x-=nx*ov;a.z-=nz*ov;c.x+=nx*ov;c.z+=nz*ov;
        var rv=(c.vx-a.vx)*nx+(c.vz-a.vz)*nz;
        if(rv<0){var im=rv*0.97;a.vx+=im*nx;a.vz+=im*nz;c.vx-=im*nx;c.vz-=im*nz;
          Som.bolas(-rv);}}}
    for(j=0;j<junkPool.length;j++){
      var o2=junkPool[j];if(!o2.onTable||o2.state!=="rest")continue;
      var ex=o2.x-a.x,ez=o2.z-a.z,ed=Math.hypot(ex,ez),sum=a.r+o2.r;
      if(ed>0&&ed<sum){
        var ux=ex/ed,uz=ez/ed;
        a.x-=ux*(sum-ed);a.z-=uz*(sum-ed);
        var rv2=(o2.vx-a.vx)*ux+(o2.vz-a.vz)*uz;
        if(rv2<0){
          var mr=1/(1+1/o2.mass),ip=rv2*1.7*mr;
          a.vx+=ip*ux;a.vz+=ip*uz;o2.vx-=ip*ux/o2.mass;o2.vz-=ip*uz/o2.mass;o2.hit=0.5;
          Som.queda(o2.t.id,-rv2*1.6,true);}}}
    if(a.x<-HW+a.r){a.x=-HW+a.r;a.vx=-a.vx*CUSH;Som.tabela(Math.abs(a.vx));}
    if(a.x> HW-a.r){a.x= HW-a.r;a.vx=-a.vx*CUSH;Som.tabela(Math.abs(a.vx));}
    if(a.z<-HL+a.r){a.z=-HL+a.r;a.vz=-a.vz*CUSH;Som.tabela(Math.abs(a.vz));}
    if(a.z> HL-a.r){a.z= HL-a.r;a.vz=-a.vz*CUSH;Som.tabela(Math.abs(a.vz));}
    for(j=0;j<POCKETS.length;j++){
      var p=POCKETS[j];
      if(Math.hypot(a.x-p.x,a.z-p.z)<POCK*0.93){
        a.live=false;a.vx=0;a.vz=0;
        Som.cacapa(a.cue);
        if(a.cue)G.foul=true;else G.potted.push(a.num);
        break;}}}
}
function stepJunk(dt){
  for(var i=0;i<junkPool.length;i++){
    var o=junkPool[i];
    if(o.state==="held"){
      o.y+=(o.holdY-o.y)*Math.min(1,10*dt);
      o.q.premultiply(new THREE.Quaternion().setFromAxisAngle(new V3(0.32,0.86,0.40).normalize(),1.5*dt));
    }
    if(o.state==="fly"){
      for(var q4=0;q4<NPCS.length;q4++){
        var np=NPCS[q4];
        var ddx=o.x-np.root.position.x,ddz=o.z-np.root.position.z;
        var ddy=o.y-(np.root.position.y+np.hitY);
        if(ddx*ddx+ddz*ddz<0.085&&Math.abs(ddy)<0.44){
          o.state="rest";o.onTable=false;o.vx=o.vy=o.vz=0;o.av.set(0,0,0);
          o.y=FLOOR+restY(o);
          var rj=o.rng||rnd;
          o.x=np.root.position.x+(rj()-0.5)*0.5;
          o.z=np.root.position.z+0.42+rj()*0.2;
          angerNPC(np,o);break;}}
      if(o.state!=="fly"){o.g.position.set(o.x,o.y,o.z);o.g.quaternion.copy(o.q);continue;}
      o.x+=o.vx*dt;o.z+=o.vz*dt;
      o.y+=o.vy*dt-0.5*GACC*dt*dt;o.vy-=GACC*dt;
      var w=o.av.length();
      if(w>1e-5)o.q.premultiply(new THREE.Quaternion().setFromAxisAngle(o.av.clone().normalize(),w*dt));
      var onT=Math.abs(o.x)<HW+0.04&&Math.abs(o.z)<HL+0.04;
      var gr=(onT?0:FLOOR)+restY(o);
      if(o.y<=gr){
        o.y=gr;
        var soft=onT?0.10:0.34;          /* o pano mata quase toda a energia */
        Som.queda(o.t.id,Math.abs(o.vy),onT);
        if(Math.abs(o.vy)>(onT?1.05:0.60)){
          o.vy=-o.vy*soft;o.vx*=onT?0.16:0.50;o.vz*=onT?0.16:0.50;
          o.av.multiplyScalar(0.35);
          var rb=o.rng||rnd;
          o.av.x+=(rb()-0.5)*3.0;o.av.z+=(rb()-0.5)*3.0;
        }else{
          o.vy=0;o.av.set(0,0,0);o.state="rest";o.onTable=onT;
          o.y=(onT?0:FLOOR)+restY(o);
          if(onT){o.vx*=0.10;o.vz*=0.10;}else{o.vx=0;o.vz=0;}}}}
    if(o.hit>0)o.hit-=dt*2;
    o.g.position.set(o.x,o.y,o.z);
    o.g.quaternion.copy(o.q);
    o.g.scale.setScalar(1+(o.hit>0?o.hit*0.10:0));}
}
function moving(){
  for(var i=0;i<G.balls.length;i++){var b=G.balls[i];
    if(b.live&&Math.hypot(b.vx,b.vz)>STOP)return true;}
  for(var j=0;j<junkPool.length;j++){var o=junkPool[j];
    if(o.state==="fly")return true;
    if(o.onTable&&Math.hypot(o.vx,o.vz)>STOP)return true;}
  return false;
}
var GACC=11.5;
function solveThrow(sx,sy,sz,tx,ty,tz){
  var dy=ty-sy,d=Math.hypot(tx-sx,tz-sz);
  var A=Math.min(0.95,0.40+d*0.11);          /* ápice acima da origem */
  if(A<dy+0.16)A=dy+0.16;                    /* sempre passa por cima do alvo */
  var tUp=Math.sqrt(2*A/GACC),tDn=Math.sqrt(2*Math.max(0.02,A-dy)/GACC),T=tUp+tDn;
  return {T:T,vx:(tx-sx)/T,vz:(tz-sz)/T,vy:GACC*tUp};
}
function hurl(o,tx,ty,tz,sem){
  if(o.state==="fly")return false;
  /* O tombo sorteia bastante (giro inicial e a cada quique). Antes isso saía
     do sorteio compartilhado, e como a tralha voa no relógio de parede as duas
     máquinas consumiam o fluxo em ordens diferentes: a tacada seguinte já
     nascia com outro desvio. Agora cada arremesso leva a sua própria semente
     na mensagem e não encosta no fluxo comum. */
  o.sem=(sem>>>0)||((rnd()*4294967296)>>>0)||1;
  o.rng=fluxo(o.sem);
  var sy=Math.max(o.y,FLOOR+0.42);o.y=sy;
  var sol=solveThrow(o.x,sy,o.z,tx,ty,tz);
  o.state="fly";o.onTable=false;o.held=false;
  o.vx=sol.vx;o.vy=sol.vy;o.vz=sol.vz;
  o.av.set((o.rng()-0.5)*15,(o.rng()-0.5)*15,(o.rng()-0.5)*15);
  return true;
}
/* mira do arremesso: pessoa sob o cursor, senão o pano */
function throwAim(){
  ray.setFromCamera(new THREE.Vector2(mouse.x,mouse.y),cam);
  var hn=ray.intersectObjects(npcMeshes,true);
  if(hn.length&&hn[0].object.userData.npcRef){
    var n=hn[0].object.userData.npcRef;
    return {x:n.root.position.x,y:n.root.position.y+n.hitY,z:n.root.position.z,npc:n};}
  var pt=new V3();
  if(ray.ray.intersectPlane(plane,pt))return {x:pt.x,y:0.075,z:pt.z,npc:null};
  return null;
}
function tableTarget(){
  var cue=G.balls[0];
  for(var k=0;k<90;k++){
    var x=(rnd()*2-1)*(HW-0.10),z=(rnd()*2-1)*(HL-0.10),ok=true,i;
    for(i=0;i<G.balls.length;i++){var b=G.balls[i];
      if(b.live&&Math.hypot(b.x-x,b.z-z)<0.13){ok=false;break;}}
    for(i=0;ok&&i<POCKETS.length;i++)
      if(Math.hypot(POCKETS[i].x-x,POCKETS[i].z-z)<POCK+0.07){ok=false;break;}
    for(i=0;ok&&i<junkPool.length;i++){var o=junkPool[i];
      if(o.onTable&&Math.hypot(o.x-x,o.z-z)<0.17){ok=false;break;}}
    if(ok&&cue.live){var dd=Math.hypot(cue.x-x,cue.z-z);if(dd<0.15||dd>1.0)ok=false;}
    if(ok)return {x:x,z:z};}
  return {x:(rnd()*2-1)*HW*0.6,z:(rnd()*2-1)*HL*0.6};
}
function shoot(dir,power,who,vel){
  var cue=G.balls[0];if(!cue.live)return;
  var an=(who==="you"?G.obj:G.foeObj).an;
  if(vel){
    /* Online: a velocidade vem pronta de quem tacou. Recalcular aqui dependia
       do fluxo de sorteio estar no mesmo ponto dos dois lados — e bastava um
       quique de tralha a mais para as duas mesas saírem diferentes. */
    cue.vx=vel.vx;cue.vz=vel.vz;
  }else{
    var dev=(1-an.precisao)*0.34*(0.35+0.65*power)*(1.45-an.controle);
    var ang=Math.atan2(dir.z,dir.x)+(rnd()-0.5)*2*dev;
    var v=(0.30+0.70*power)*(2.1+an.potencia*4.6);
    cue.vx=Math.cos(ang)*v;cue.vz=Math.sin(ang)*v;
  }
  Som.tacada(power,(who==="you"?G.obj:G.foeObj).id);
  G.potted=[];G.foul=false;G.phase="roll";G.shots++;
}
function railClamp(x,z,dx,dz,maxT){
  var t=maxT;
  if(dx>1e-6)t=Math.min(t,(HW-BR-x)/dx); if(dx<-1e-6)t=Math.min(t,(-HW+BR-x)/dx);
  if(dz>1e-6)t=Math.min(t,(HL-BR-z)/dz); if(dz<-1e-6)t=Math.min(t,(-HL+BR-z)/dz);
  return Math.max(0.02,t);
}
function firstHit(ox,oz,dx,dz,maxT){
  var best=maxT,hit=null,i;
  function circ(cx,cz,rad,tag,ref){
    var ex=cx-ox,ez=cz-oz,b=ex*dx+ez*dz;if(b<0)return;
    var d2=ex*ex+ez*ez-b*b,R=rad+BR;if(d2>R*R)return;
    var t=b-Math.sqrt(R*R-d2);
    if(t>0.001&&t<best){best=t;hit={x:ox+dx*t,z:oz+dz*t,t:t,tag:tag,ref:ref};}}
  for(i=1;i<G.balls.length;i++)if(G.balls[i].live)circ(G.balls[i].x,G.balls[i].z,BR,"ball",G.balls[i]);
  for(i=0;i<junkPool.length;i++){var o=junkPool[i];
    if(o.onTable&&o.state==="rest")circ(o.x,o.z,o.r,"junk",o);}
  var bt=maxT;
  if(dx>1e-6)bt=Math.min(bt,(HW-BR-ox)/dx); if(dx<-1e-6)bt=Math.min(bt,(-HW+BR-ox)/dx);
  if(dz>1e-6)bt=Math.min(bt,(HL-BR-oz)/dz); if(dz<-1e-6)bt=Math.min(bt,(-HL+BR-oz)/dz);
  if(bt<best)return {x:ox+dx*bt,z:oz+dz*bt,t:bt,tag:"rail"};
  return hit||{x:ox+dx*maxT,z:oz+dz*maxT,t:maxT,tag:"none"};
}
function mine(num,who){
  var g=who==="you"?G.group:G.foeGroup;
  if(!g)return null;
  return (num%2===1)===(g==="odd");
}
function remaining(g){
  var n=0;
  for(var i=1;i<G.balls.length;i++){var b=G.balls[i];
    if(b.live&&((b.num%2===1)===(g==="odd")))n++;}
  return n;
}
function foeAimCompute(){
  var cue=G.balls[0],best=null;
  for(var i=1;i<G.balls.length;i++){
    var b=G.balls[i];if(!b.live)continue;
    if(G.foeGroup&&!((b.num%2===1)===(G.foeGroup==="odd")))continue;
    for(var j=0;j<POCKETS.length;j++){
      var p=POCKETS[j],pdx=b.x-p.x,pdz=b.z-p.z,pl=Math.hypot(pdx,pdz);if(pl<1e-4)continue;
      var gx=b.x+pdx/pl*BR*2,gz=b.z+pdz/pl*BR*2;
      var cdx=gx-cue.x,cdz=gz-cue.z,cl=Math.hypot(cdx,cdz);if(cl<1e-4)continue;
      var dx=cdx/cl,dz=cdz/cl,dot=dx*(-pdx/pl)+dz*(-pdz/pl);
      if(dot<0.32)continue;
      var f=firstHit(cue.x,cue.z,dx,dz,4.5);
      var clear=(f.tag==="ball"&&Math.hypot(f.x-gx,f.z-gz)<BR*2.6)?1:0.22;
      var sc=dot*clear*(1/(0.5+pl))*(1/(0.6+cl*0.4));
      if(!best||sc>best.sc)best={sc:sc,dx:dx,dz:dz,pw:Math.min(1,0.42+cl*0.26+pl*0.2)};}}
  if(!best){var a=rnd()*TAU;best={sc:0,dx:Math.cos(a),dz:Math.sin(a),pw:0.55};}
  return best;
}

/* ══ TURNOS ══ */
var setUI=null,mouse={x:0,y:0},sx=0,sy=0,prev=0,toastT=0;
var DT_FIXO=1/120,acumul=0;
function ui(p){if(setUI)setUI(function(s){return Object.assign({},s,p);});}
function toast(t,sub,k){toastT=1.7;ui({toast:t,toastSub:sub||"",toastKind:k||"good"});}
function sync(){
  ui({turn:G.turn,phase:G.phase,group:G.group,shots:G.shots,throwsLeft:G.throwsLeft,
    live:G.balls.slice(1).filter(function(b){return b.live;}).map(function(b){return b.num;}),
    sel:G.obj.id,foeSel:G.foeObj.id,held:G.held?G.held.t.nome:null});
}
function respot(){
  var c=G.balls[0];c.live=true;c.vx=0;c.vz=0;c.x=0;c.z=HL*0.56;
  for(var k=0;k<90;k++){
    var bad=false,i;
    for(i=1;i<G.balls.length;i++){var b=G.balls[i];
      if(b.live&&Math.hypot(b.x-c.x,b.z-c.z)<BR*2.3){bad=true;break;}}
    for(i=0;!bad&&i<junkPool.length;i++){var o=junkPool[i];
      if(o.onTable&&Math.hypot(o.x-c.x,o.z-c.z)<o.r+BR*1.4){bad=true;break;}}
    if(!bad)return;
    c.x=(rnd()*2-1)*HW*0.72;c.z=HL*(0.25+rnd()*0.42);}
}
/* Quem tacou é a autoridade daquela jogada: no fim ele manda a mesa inteira e
   o outro lado encaixa. É o que fecha qualquer diferença que tenha nascido de
   uma tralha arremessada no meio da rolagem, que chega em instantes simulados
   diferentes nas duas máquinas. */
function endTurn(){
  var quem=G.turn;
  fecharJogada();
  if(G.modo!=="online")return;
  if(quem==="you"){ Rede.enviar({t:"estado",auto:1,s:tirarSnap()}); }
  else if(snapPend){ var sp=snapPend; snapPend=null; aplicarSnap(sp,true); }
}
function fecharJogada(){
  G.balls.forEach(function(b){b.vx=0;b.vz=0;});
  junkPool.forEach(function(o){if(o.onTable){o.vx=0;o.vz=0;}});
  var who=G.turn,potted=G.potted.slice(),foul=G.foul;
  if(!G.balls[0].live)respot();
  if(G.group===null&&potted.length){
    var g=(potted[0]%2===1)?"odd":"even";
    if(who==="you"){G.group=g;G.foeGroup=g==="odd"?"even":"odd";}
    else{G.foeGroup=g;G.group=g==="odd"?"even":"odd";}
    toast(G.group==="odd"?"Você é ímpares":"Você é pares","mesa definida","cold");}
  var own=0,other=0;
  potted.forEach(function(n){var m=mine(n,who);if(m===true)own++;else if(m===false)other++;});
  if(remaining("odd")===0||remaining("even")===0){
    var wg=remaining("odd")===0?"odd":"even";
    G.winner=(G.group===wg)?"you":"foe";G.over=true;G.phase="over";
    ui({over:true,winner:G.winner,shots:G.shots,group:G.group});return;}
  var again=own>0&&!foul;
  if(who==="you"){
    if(foul)toast("Branca na caçapa","passou a vez","bad");
    else if(own&&!other)toast(own>1?own+" na caçapa":"Encaçapou","joga de novo","good");
    else if(other)toast("Bola do adversário","passou a vez","bad");
    if(again){G.phase="aim";sync();return;}
    G.turn="foe";
    if(G.modo==="online"){G.phase="aguardando";}
    else{G.phase="foe-pick";G.anim=0.6;}
  }else{
    if(again){G.phase="foe-pick";G.anim=0.55;sync();return;}
    G.turn="you";G.phase="aim";
    if(G.held){G.held.state="idle";G.held.y=FLOOR+restY(G.held);G.held=null;}
    G.throwsLeft=Math.min(3,G.throwsLeft+1);
    toast("Sua vez","","good");}
  sync();
}
