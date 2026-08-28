/* Sinuca Suja — Materiais PBR
   Sem bundler: carregado por <script> no index.html, na ordem definida lá. */

/* ══ MATERIAIS ══ */
var MAT={};
function buildMaterials(env){
  var e=function(o){o.envMap=env;o.envMapIntensity=o.envMapIntensity||0.8;return M(o);};
  MAT.wood     = e({map:TX.wood,roughness:.62,metalness:.04});
  MAT.woodDark = e({map:TX.wood,color:0x6E5240,roughness:.72,metalness:.03});
  MAT.woodPale = e({map:TX.wood,color:0xC9A882,roughness:.48,metalness:.03});
  MAT.rail     = e({map:TX.wood,color:0x9A6A44,roughness:.34,metalness:.06,envMapIntensity:1.1});
  MAT.felt     = e({map:TX.felt,roughness:1,metalness:0,envMapIntensity:0});
  MAT.wall     = e({map:TX.wall,roughness:.95,metalness:0,envMapIntensity:.3});
  MAT.tile     = e({map:TX.tile,roughness:.55,metalness:.02,envMapIntensity:.5});
  MAT.brass    = e({color:0xC79A3E,roughness:.26,metalness:.95,envMapIntensity:1.5});
  MAT.steel    = e({color:0xB9BEC4,roughness:.30,metalness:.92,envMapIntensity:1.4});
  MAT.chrome   = e({color:0xE2E6EA,roughness:.11,metalness:1,envMapIntensity:1.8});
  MAT.glassG   = e({color:0x2E6B3A,roughness:.06,metalness:0,transparent:true,opacity:.62,envMapIntensity:2.2});
  MAT.glassC   = e({color:0xC8DCE4,roughness:.05,metalness:0,transparent:true,opacity:.34,envMapIntensity:2.4});
  MAT.label    = e({map:TX.label,roughness:.85,metalness:0});
  MAT.rubber   = e({color:0x14171C,roughnessMap:TX.grain,roughness:.88,metalness:.02});
  MAT.leather  = e({color:0x2A2F38,roughnessMap:TX.grain,roughness:.62,metalness:.04});
  MAT.canvasW  = e({color:0xD8D3C4,roughnessMap:TX.grain,roughness:.92,metalness:0});
  MAT.fabricB  = e({color:0x1C2C4A,roughness:.94,metalness:0});
  MAT.bristle  = e({color:0xB07A2E,roughness:.94,metalness:0});
  MAT.stone    = e({map:TX.granite,roughness:.97,metalness:.02,flatShading:true,envMapIntensity:.35});
  MAT.net      = e({map:TX.net,color:0xE6DCBE,roughness:.94,metalness:0,transparent:true,
                    alphaTest:.42,side:THREE.DoubleSide,envMapIntensity:.2});
  MAT.bootRub  = e({color:0x16324A,roughnessMap:TX.grain,roughness:.42,metalness:.03,envMapIntensity:.9});
  MAT.bootSole = e({color:0x14161A,roughnessMap:TX.grain,roughness:.86,metalness:.02});
  MAT.flipSole = e({color:0x1D4E8C,roughnessMap:TX.grain,roughness:.72,metalness:.02});
  MAT.flipFoam = e({color:0xC9BC9E,roughnessMap:TX.grain,roughness:.94,metalness:0});
  MAT.strap    = e({color:0xF0EADA,roughness:.55,metalness:.02,envMapIntensity:.8});
  MAT.paper    = e({color:0xCFC0A0,roughness:.96,metalness:0});
  MAT.orange   = e({color:0xE07C12,roughness:.82,metalness:0});
  MAT.tinRed   = e({color:0xB4271C,roughness:.24,metalness:.85,envMapIntensity:1.3});
}
