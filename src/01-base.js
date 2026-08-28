/* Sinuca Suja — Constantes da mesa, cores das bolas
   Sem bundler: este arquivo é carregado direto por <script> no index.html,
   na ordem definida lá. Tudo compartilha o escopo global. */

var h=React.createElement,TAU=Math.PI*2,V3=THREE.Vector3,V2=THREE.Vector2;
var BR=0.0286,HW=0.56,HL=1.12,POCK=0.064,MU=0.55,CUSH=0.86,STOP=0.02,FLOOR=-0.78;
var POCKETS=[{x:-HW,z:-HL},{x:HW,z:-HL},{x:-HW,z:0},{x:HW,z:0},{x:-HW,z:HL},{x:HW,z:HL}];
var BCOL=["#E8B71E","#2660C4","#CF3227","#7B3FBF","#DE6F1B","#1F8F58","#7E2A33",
          "#15181D","#E8B71E","#2660C4","#CF3227","#7B3FBF","#DE6F1B","#1F8F58"];
