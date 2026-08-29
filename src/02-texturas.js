/* ══ TEXTURAS PROCEDURAIS ══ */
function cvs(w,ht){var c=document.createElement("canvas");c.width=w;c.height=ht;return c;}
function tex(c,rx,ry,srgb){
  var t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=8;
  if(srgb)t.encoding=THREE.sRGBEncoding;
  return t;
}
function noise(x,w,ht,n,a,col){
  for(var i=0;i<n;i++){
    x.fillStyle="rgba("+col+","+(Math.random()*a).toFixed(3)+")";
    var r=Math.random()*3+0.4;
    x.beginPath();x.arc(Math.random()*w,Math.random()*ht,r,0,TAU);x.fill();
  }
}
var TX={};
function buildTextures(){
  var c,x,i;
  /* pano — feltro com fiapos e manchas */
  c=cvs(512,512);x=c.getContext("2d");
  x.fillStyle="#1E6B47";x.fillRect(0,0,512,512);
  noise(x,512,512,11000,0.055,"255,255,255");
  noise(x,512,512,9000,0.075,"0,0,0");
  for(i=0;i<7;i++){
    var g=x.createRadialGradient(Math.random()*512,Math.random()*512,30,
                                 Math.random()*512,Math.random()*512,150+Math.random()*160);
    g.addColorStop(0,"rgba(8,34,22,0.055)");g.addColorStop(1,"rgba(8,34,22,0)");
    x.fillStyle=g;x.fillRect(0,0,512,512);
  }
  TX.felt=tex(c,4.4,4.4,1);
  c=cvs(256,256);x=c.getContext("2d");x.fillStyle="#808080";x.fillRect(0,0,256,256);
  noise(x,256,256,14000,0.5,"255,255,255");noise(x,256,256,12000,0.5,"0,0,0");
  TX.feltR=tex(c,3,6);

  /* madeira */
  c=cvs(512,512);x=c.getContext("2d");
  x.fillStyle="#5A3620";x.fillRect(0,0,512,512);
  for(i=0;i<150;i++){
    x.strokeStyle="rgba("+(Math.random()<0.5?"30,16,8":"140,96,58")+","+(0.05+Math.random()*0.24).toFixed(2)+")";
    x.lineWidth=0.5+Math.random()*3.4;x.beginPath();
    var y0=Math.random()*512;x.moveTo(0,y0);
    for(var s=0;s<=512;s+=32)x.lineTo(s,y0+Math.sin(s*0.017+y0)*7+Math.sin(s*0.005)*13);
    x.stroke();
  }
  for(i=0;i<9;i++){
    var kx=Math.random()*512,ky=Math.random()*512;
    for(var r=2;r<26;r+=2.6){
      x.strokeStyle="rgba(26,14,7,"+(0.30-r*0.010).toFixed(2)+")";x.lineWidth=1.5;
      x.beginPath();x.ellipse(kx,ky,r,r*0.55,Math.random(),0,TAU);x.stroke();
    }
  }
  noise(x,512,512,9000,0.14,"0,0,0");
  TX.wood=tex(c,1,1,1);

  /* parede encardida */
  c=cvs(512,512);x=c.getContext("2d");
  x.fillStyle="#3A342B";x.fillRect(0,0,512,512);
  for(i=0;i<50;i++){
    var g2=x.createRadialGradient(Math.random()*512,Math.random()*512,3,Math.random()*512,Math.random()*512,40+Math.random()*120);
    g2.addColorStop(0,"rgba("+(Math.random()<0.5?"20,16,10":"96,84,64")+",0.28)");
    g2.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g2;x.fillRect(0,0,512,512);
  }
  for(i=0;i<26;i++){ /* escorridos */
    x.fillStyle="rgba(18,14,9,"+(0.06+Math.random()*0.13).toFixed(2)+")";
    x.fillRect(Math.random()*512,0,1+Math.random()*5,80+Math.random()*400);
  }
  noise(x,512,512,17000,0.13,"0,0,0");
  TX.wall=tex(c,2.4,1.4,1);

  /* piso quadriculado imundo */
  c=cvs(512,512);x=c.getContext("2d");
  for(i=0;i<4;i++)for(var j=0;j<4;j++){
    x.fillStyle=(i+j)%2?"#2B2C2A":"#3E3B33";x.fillRect(i*128,j*128,128,128);
    x.strokeStyle="rgba(12,12,10,0.75)";x.lineWidth=4;x.strokeRect(i*128,j*128,128,128);
  }
  for(i=0;i<8;i++){
    var g3=x.createRadialGradient(Math.random()*512,Math.random()*512,60,
                                  Math.random()*512,Math.random()*512,170+Math.random()*180);
    g3.addColorStop(0,"rgba(14,12,8,0.13)");g3.addColorStop(1,"rgba(14,12,8,0)");
    x.fillStyle=g3;x.fillRect(0,0,512,512);
  }
  noise(x,512,512,15000,0.11,"0,0,0");
  TX.tile=tex(c,5,7,1);

  /* rótulo de cerveja */
  c=cvs(256,256);x=c.getContext("2d");
  x.fillStyle="#E4DAB8";x.fillRect(0,0,256,256);
  x.fillStyle="#8E1F1A";x.fillRect(0,86,256,84);
  x.fillStyle="#C8A23A";x.fillRect(0,80,256,7);x.fillRect(0,170,256,7);
  x.fillStyle="#E4DAB8";x.font="bold 44px Georgia";x.textAlign="center";x.fillText("BOCA",128,142);
  x.fillStyle="#5A4A2A";x.font="16px Georgia";x.fillText("• PILSEN •",128,44);x.fillText("600 ml",128,214);
  noise(x,256,256,6000,0.22,"60,40,20");
  TX.label=tex(c,1,1,1);

  /* rede das caçapas */
  c=cvs(128,128);x=c.getContext("2d");
  x.clearRect(0,0,128,128);
  x.strokeStyle="#DCCFAE";x.lineWidth=8;x.lineCap="round";
  for(i=-4;i<=8;i++){
    x.beginPath();x.moveTo(i*32,0);x.lineTo(i*32+128,128);x.stroke();
    x.beginPath();x.moveTo(i*32,128);x.lineTo(i*32+128,0);x.stroke();}
  TX.net=tex(c,4,2,1);

  /* granito */
  c=cvs(256,256);x=c.getContext("2d");
  x.fillStyle="#6A665E";x.fillRect(0,0,256,256);
  noise(x,256,256,9000,0.55,"30,28,24");
  noise(x,256,256,6000,0.45,"190,186,176");
  noise(x,256,256,2200,0.60,"120,112,96");
  TX.granite=tex(c,2,2,1);

  /* couro / borracha */
  c=cvs(256,256);x=c.getContext("2d");
  x.fillStyle="#8C8C8C";x.fillRect(0,0,256,256);
  noise(x,256,256,20000,0.55,"255,255,255");noise(x,256,256,16000,0.5,"0,0,0");
  TX.grain=tex(c,3,3);
}

/* ══ HELPERS DE GEOMETRIA ══ */
function lathe(prof,seg){
  return new THREE.LatheGeometry(prof.map(function(p){return new V2(Math.max(p[0],0.0001),p[1]);}),seg||28);
}
function footShape(sc){
  sc=sc||1;
  var S=function(a,b){return [a*sc,b*sc];},sh=new THREE.Shape();
  sh.moveTo(0,0.130*sc);
  sh.bezierCurveTo(0.050*sc,0.128*sc, 0.059*sc,0.068*sc, 0.052*sc,0.016*sc);
  sh.bezierCurveTo(0.048*sc,-0.046*sc, 0.042*sc,-0.104*sc, 0.025*sc,-0.130*sc);
  sh.bezierCurveTo(0.009*sc,-0.146*sc, -0.009*sc,-0.146*sc, -0.025*sc,-0.130*sc);
  sh.bezierCurveTo(-0.042*sc,-0.104*sc, -0.048*sc,-0.046*sc, -0.052*sc,0.016*sc);
  sh.bezierCurveTo(-0.059*sc,0.068*sc, -0.050*sc,0.128*sc, 0,0.130*sc);
  return sh;
}
function footSlab(sc,dep,bev){
  var g=new THREE.ExtrudeGeometry(footShape(sc),
    {depth:dep,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:3,curveSegments:16});
  g.rotateX(-Math.PI/2);g.center();
  return g;
}
function M(o){
  var m=new THREE.MeshStandardMaterial(o);
  return m;
}
function mesh(g,m,px,py,pz){
  var e=new THREE.Mesh(g,m);
  if(px!==undefined)e.position.set(px,py,pz);
  e.castShadow=true;e.receiveShadow=true;return e;
}
