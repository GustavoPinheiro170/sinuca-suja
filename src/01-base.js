var h=React.createElement,TAU=Math.PI*2,V3=THREE.Vector3,V2=THREE.Vector2;
var BR=0.0286,HW=0.56,HL=1.12,POCK=0.064,MU=0.55,CUSH=0.86,STOP=0.02,FLOOR=-0.78;

/* ── SORTEIO COM SEMENTE ──
   No multiplayer as duas máquinas simulam a mesma partida em paralelo, e para
   isso todo sorteio que afeta a física precisa dar o mesmo resultado dos dois
   lados. rnd() é um mulberry32 semeado pelo código da sala. O que é puramente
   visual (texturas, áudio, o neon piscando) continua em Math.random. */
var _sem=123456789;
function semear(x){_sem=(x>>>0)||1;}
function rnd(){
  _sem=(_sem+0x6D2B79F5)>>>0;
  var t=_sem;
  t=Math.imul(t^(t>>>15),t|1);
  t^=t+Math.imul(t^(t>>>7),t|61);
  return ((t^(t>>>14))>>>0)/4294967296;
}
var POCKETS=[{x:-HW,z:-HL},{x:HW,z:-HL},{x:-HW,z:0},{x:HW,z:0},{x:-HW,z:HL},{x:HW,z:HL}];
var BCOL=["#E8B71E","#2660C4","#CF3227","#7B3FBF","#DE6F1B","#1F8F58","#7E2A33",
          "#15181D","#E8B71E","#2660C4","#CF3227","#7B3FBF","#DE6F1B","#1F8F58"];
