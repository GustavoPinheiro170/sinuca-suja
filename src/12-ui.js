/* ══ UI ══ */
function Bars(p){
  var a=p.an;
  return h("div",{className:"bars"},
    h("div",{className:"bar b1"},h("span",null,"Prec"),h("div",null,h("i",{style:{width:(a.precisao*100).toFixed(0)+"%"}}))),
    h("div",{className:"bar b2"},h("span",null,"Pot"),h("div",null,h("i",{style:{width:(a.potencia*100).toFixed(0)+"%"}}))),
    h("div",{className:"bar b3"},h("span",null,"Ctrl"),h("div",null,h("i",{style:{width:(a.controle*100).toFixed(0)+"%"}}))));
}
function ObjCard(p){
  var o=p.o,a=o.an;
  return h("div",{className:"card"},
    h("h5",null,p.label),
    h("b",{className:"nm"},o.nome),
    h("span",{className:"tp"},"ponta: ",a.tipName,h("br",null),
      h("u",null,"Ø"+(a.tipR*2000).toFixed(1)+"mm · "+(a.mass*1000).toFixed(0)+"g · incl. "+
        (a.elev*180/Math.PI).toFixed(0)+"°")),
    h(Bars,{an:a}),
    p.go?h("span",{className:"go"},"clique para pegar"):null);
}
function Pips(p){
  var out=[];
  for(var n=1;n<=14;n++){
    if((n%2===1)!==(p.g==="odd"))continue;
    var live=p.live&&p.live.indexOf(n)>=0;
    out.push(h("div",{key:n,className:"pip"+(live?"":" gone"),
      style:{background:live?BCOL[n-1]:"transparent"},title:String(n)}));}
  return h("div",{className:"pips"},out);
}
function App(){
  var stt=React.useState({started:false,over:false,turn:"you",phase:"aim",group:null,shots:0,
    throwsLeft:3,live:[],sel:"taco",foeSel:"cadeira",toast:null,toastSub:"",toastKind:"good",
    power:0,winner:null,hov:null,hx:0,hy:0,som:Som.ativo(),
    tela:"menu",modo:"ia",sala:null,rede:"off",redeMsg:"",codigo:""});
  var s=stt[0],set=stt[1];
  React.useEffect(function(){setUI=set;},[]);
  React.useEffect(function(){
    var id=setInterval(function(){if(G)set(function(o){return Object.assign({},o,{power:G.power});});},50);
    return function(){clearInterval(id);};},[]);
  function start(){
    Som.iniciar();
    G=newGame();equip(OBJECTS[0]);equipFoe(OBJECTS[2]);
    G.modo="ia";
    set(function(o){return Object.assign({},o,{started:true,over:false,modo:"ia",turn:"you",phase:"aim",
      group:null,shots:0,throwsLeft:3,sel:"taco",foeSel:"cadeira",winner:null,toast:null,
      live:[1,2,3,4,5,6,7,8,9,10,11,12,13,14]});});}

  function redeStatus(e,extra){
    set(function(o){return Object.assign({},o,{rede:e,
      redeMsg:(e==="reconectando"?("tentativa "+extra):(typeof extra==="string"?extra:""))});});
  }
  function criarSala(){
    set(function(o){return Object.assign({},o,{tela:"criar",rede:"abrindo"});});
    var c=Rede.criar(function(){ iniciarOnline(Rede.semente(Rede.sala())); },redeStatus);
    set(function(o){return Object.assign({},o,{sala:c});});
  }
  function entrarSala(){
    /* lê do campo, não do estado: evita perder um clique dado antes do re-render */
    var el=document.querySelector(".campo");
    var c=(((el&&el.value)||s.codigo||"")+"").toUpperCase().replace(/[^A-Z0-9]/g,"");
    if(c.length<4){
      set(function(o){return Object.assign({},o,{rede:"erro",redeMsg:"código curto"});});
      return;}
    set(function(o){return Object.assign({},o,{tela:"entrar",rede:"abrindo",codigo:c});});
    Rede.entrar(c,null,redeStatus);
  }
  function voltar(){ Rede.sair();
    set(function(o){return Object.assign({},o,{tela:"menu",rede:"off",redeMsg:"",sala:null});}); }

  if(!s.started||s.over){
    var rotulo={off:"",abrindo:"abrindo canal…",esperando:"aguardando o adversário",
      conectando:"conectando…",ligado:"conectado",caiu:"conexão caiu",
      reconectando:"reconectando",erro:"erro"}[s.rede]||s.rede;
    var classe=s.rede==="ligado"?"ok":(s.rede==="erro"||s.rede==="caiu"?"mal":"esp");
    return h("div",{className:"ui"},h("div",{className:"veil"},h("div",{className:"vi"},
      s.over
        ? h(React.Fragment,null,
            h("h1",null,s.winner==="you"?"Você limpou":h(React.Fragment,null,"O ",h("em",null,"outro")," limpou")),
            h("p",{className:"kick"},(s.group==="odd"?"você era ímpares":"você era pares")+" · "+s.shots+" tacadas"),
            h("button",{className:"btn",onClick:function(){voltar();
              set(function(o){return Object.assign({},o,{started:false,over:false,tela:"menu"});});}},"Voltar ao menu"))
      : s.tela==="menu"
        ? h(React.Fragment,null,
            h("h1",null,"Sinuca ",h("em",null,"Suja")),
            h("p",{className:"kick"},"Bar do fim da rua · pares ou ímpares"),
            h("p",null,"Todo objeto do bar vira taco. ",h("b",null,"Clique nele no cenário"),
              " — o jogo analisa a geometria e ",h("u",null,"descobre sozinho qual ponta usar"),"."),
            h("div",{className:"menu"},
              h("button",{className:"op pri",onClick:start},
                h("b",null,"Contra o Trapaceiro"),
                h("span",null,"Sozinho, contra a máquina. Começa na hora.")),
              h("button",{className:"op",onClick:criarSala},
                h("b",null,"Criar sala"),
                h("span",null,"Gera um código para você mandar a um amigo.")),
              h("button",{className:"op",onClick:function(){
                  set(function(o){return Object.assign({},o,{tela:"entrar"});});}},
                h("b",null,"Entrar em sala"),
                h("span",null,"Já tem um código? Cole aqui e jogue."))))
      : s.tela==="criar"
        ? h(React.Fragment,null,
            h("h1",null,"Sala ",h("em",null,"aberta")),
            h("p",{className:"kick"},"Mande este código ao seu adversário"),
            h("div",{className:"cod"},s.sala||"·····"),
            h("p",null,"Ele abre o jogo, escolhe ",h("b",null,"Entrar em sala"),
              " e digita esse código. A partida começa sozinha quando ele entrar.",
              h("br",null),h("br",null),
              h("u",null,"Você quebra.")," A conexão é direta entre os dois navegadores — não passa por servidor de jogo."),
            h("p",{className:"stt "+classe},rotulo+(s.redeMsg?" · "+s.redeMsg:"")),
            h("button",{className:"volta",onClick:voltar},"← cancelar"))
      : h(React.Fragment,null,
            h("h1",null,"Entrar na ",h("em",null,"sala")),
            h("p",{className:"kick"},"Digite o código que o anfitrião te passou"),
            h("input",{className:"campo",value:s.codigo,maxLength:5,autoFocus:true,
              placeholder:"ABC12",
              onChange:function(e){var v=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"");
                set(function(o){return Object.assign({},o,{codigo:v});});},
              onKeyDown:function(e){if(e.key==="Enter")entrarSala();}}),
            h("p",{className:"stt "+classe},rotulo+(s.redeMsg?" · "+s.redeMsg:"")),
            h("button",{className:"btn",style:{marginTop:"16px"},onClick:entrarSala},"Entrar"),
            h("br",null),
            h("button",{className:"volta",onClick:voltar},"← voltar"))
    )));
  }

  var throwing=(s.turn==="foe"&&(s.phase==="foe-pick"||s.phase==="foe-aim")&&s.throwsLeft>0);
  var msg=s.held
    ? "Mire e clique para arremessar · esc larga"
    : (s.turn==="foe"
      ? (throwing?"Clique numa tralha do bar":"Trapaceiro jogando")
      : (s.phase==="roll"?"Bolas rolando"
        :(s.power>0.02?("Força "+Math.round(s.power*100)+"% · solte para bater")
        :"Pressione e puxe o taco para trás")));
  var cur=OBJECTS.filter(function(o){return o.id===s.sel;})[0]||OBJECTS[0];
  var foeO=OBJECTS.filter(function(o){return o.id===s.foeSel;})[0];
  var hovObj=s.hov&&s.hov.k==="cue"?OBJECTS.filter(function(o){return o.id===s.hov.id;})[0]:null;

  return h("div",{className:"ui"},
    s.modo==="online"?h("div",{className:"conn"+(s.rede==="ligado"?"":" mal")},
      h("i",null),(s.rede==="ligado"?("sala "+(s.sala||"")):
        (s.rede==="reconectando"?"reconectando…":"conexão caiu"))):null,
    h("button",{className:"som"+(s.som?"":" off"),title:s.som?"Som ligado":"Som desligado",
      onClick:function(){Som.iniciar();set(function(o){return Object.assign({},o,{som:Som.alternar()});});}},
      s.som?"\u266A":"\u2715"),
    h("div",{className:"top"},h("div",{className:"sb"},
      h("div",{className:"sd"+(s.turn==="you"?" on":"")},
        h("em",null,"Você"),
        h("strong",null,s.group?(s.group==="odd"?"ÍMPARES":"PARES"):"mesa aberta"),
        s.group?h(Pips,{g:s.group,live:s.live}):null),
      h("div",{className:"mid"},h("b",null,s.shots),h("span",null,"tacadas")),
      h("div",{className:"sd"+(s.turn==="foe"?" on":"")},
        h("em",null,"Trapaceiro"),
        h("strong",null,s.group?(s.group==="odd"?"PARES":"ÍMPARES"):"mesa aberta"),
        s.group?h(Pips,{g:s.group==="odd"?"even":"odd",live:s.live}):null))),

    h("div",{className:"eq"},h(ObjCard,{o:cur,label:"na sua mão"})),

    h("div",{className:"card sab"+(throwing?" live":"")},
      h("h5",null,"Arremessos"),h("b",{className:"n"},s.throwsLeft),
      h("p",null,s.held?("Na mão: "+s.held.toLowerCase()+". Mire onde quiser e clique.")
        :(throwing?"Pegue uma bota, lata, pedra — e mire com calma."
        :(s.turn==="foe"?"Tarde demais nesta tacada."
        :"Guarde para quando ele estiver mirando."))),
      foeO?h("p",null,"Ele está com "+foeO.nome.toLowerCase()):null),

    h("div",{className:"pw"},
      h("div",{className:"pt"+(s.power>0.02?" arm":(throwing?" throw":""))},msg),
      h("div",{className:"pb"},h("i",{style:{width:(s.power*100).toFixed(1)+"%"}}))),
    h("div",{className:"hint"},s.held?"o arco mostra onde vai cair · mirar em gente tem troco"
      :"puxe para trás para dar força · clique na tralha do pano para tirá-la (custa a vez)"),

    hovObj?h("div",{className:"hov",style:{left:s.hx+"px",top:s.hy+"px"}},
      h(ObjCard,{o:hovObj,label:"no cenário",go:1})):null,
    s.hov&&s.hov.k==="junk"?h("div",{className:"hov",style:{left:s.hx+"px",top:s.hy+"px"}},
      h("div",{className:"card"},h("h5",null,"tralha"),h("b",{className:"nm"},s.hov.n),
        h("span",{className:"go"},"clique para pegar"))):null,
    s.hov&&s.hov.k==="rm"?h("div",{className:"hov rmv",style:{left:s.hx+"px",top:s.hy+"px"}},
      h("div",{className:"card"},h("h5",null,"atrapalhando"),h("b",{className:"nm"},s.hov.n),
        h("span",{className:"tp"},"tirar do pano limpa a jogada"),
        h("span",{className:"go"},"custa a sua vez"))):null,

    s.toast?h("div",{className:"toast "+s.toastKind},s.toast,
      s.toastSub?h("small",null,s.toastSub):null):null);
}

initScene();
requestAnimationFrame(frame);
ReactDOM.createRoot(document.getElementById("root")).render(h(App));
