/* Sinuca Suja — HUD em React e arranque do jogo
   Sem bundler: este arquivo é carregado direto por <script> no index.html,
   na ordem definida lá. Tudo compartilha o escopo global. */

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
    power:0,winner:null,hov:null,hx:0,hy:0});
  var s=stt[0],set=stt[1];
  React.useEffect(function(){setUI=set;},[]);
  React.useEffect(function(){
    var id=setInterval(function(){if(G)set(function(o){return Object.assign({},o,{power:G.power});});},50);
    return function(){clearInterval(id);};},[]);
  function start(){
    G=newGame();equip(OBJECTS[0]);equipFoe(OBJECTS[2]);
    set(function(o){return Object.assign({},o,{started:true,over:false,turn:"you",phase:"aim",
      group:null,shots:0,throwsLeft:3,sel:"taco",foeSel:"cadeira",winner:null,toast:null,
      live:[1,2,3,4,5,6,7,8,9,10,11,12,13,14]});});}

  if(!s.started||s.over)
    return h("div",{className:"ui"},h("div",{className:"veil"},h("div",{className:"vi"},
      s.over
        ? h(React.Fragment,null,
            h("h1",null,s.winner==="you"?"Você limpou":h(React.Fragment,null,"O ",h("em",null,"Trapaceiro")," limpou")),
            h("p",{className:"kick"},(s.group==="odd"?"você era ímpares":"você era pares")+" · "+s.shots+" tacadas"),
            h("button",{className:"btn",onClick:start},"Revanche"))
        : h(React.Fragment,null,
            h("h1",null,"Sinuca ",h("em",null,"Suja")),
            h("p",{className:"kick"},"Bar do fim da rua · pares ou ímpares"),
            h("p",null,"Todo objeto do bar vira taco. ",h("b",null,"Clique nele no cenário"),
              " — o jogo analisa a geometria e ",h("u",null,"descobre sozinho qual ponta usar"),
              ", e inclina o objeto o bastante para não raspar no pano.",h("br",null),h("br",null),
              "A primeira bola que cair define seu grupo. Encaçape as sete e ganhou.",h("br",null),h("br",null),
              "Tralha atravancando o seu jogo? ",h("u",null,"Clique nela para tirar do pano"),
              " — mas isso custa a sua vez, e ela volta ao bar para ser jogada de novo depois.",
              h("br",null),h("br",null),
              "Enquanto ",h("b",null,"o Trapaceiro")," mira, pegue qualquer tralha do bar, ",
              h("u",null,"mire e arremesse na hora que quiser"),". Ele faz o mesmo com você.",
              h("br",null),h("br",null),
              "Seu Waldir está atrás do balcão e tem um bêbado bebendo ali. ",
              h("u",null,"Acerte um deles e veja o que acontece"),".",h("br",null),h("br",null),
              h("u",null,"Botão direito gira a câmera · roda dá zoom")),
            h("button",{className:"btn",onClick:start},"Quebrar"))
    )));

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
