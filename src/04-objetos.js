/* Sinuca Suja — Objetos-taco, análise da ponta e tralha arremessável
   Sem bundler: carregado por <script> no index.html, na ordem definida lá. */

/* ══ OBJETOS-TACO ══ */
/* `parts` alimenta a análise geométrica; `build` desenha. Mesmas dimensões. */
var OBJECTS=[
 {id:"taco",nome:"Taco lascado",dens:700,home:{p:[-1.06,-0.78,1.62],r:[0.32,0.80,0]},
  parts:[
   {n:"coronilha",t:"cyl",p:[0,0.375,0],a:[0,1,0],len:0.75,r0:0.0225,r1:0.0170},
   {n:"corpo",t:"cyl",p:[0,1.110,0],a:[0,1,0],len:0.72,r0:0.0170,r1:0.0068},
   {n:"sola de couro",t:"cyl",p:[0,1.476,0],a:[0,1,0],len:0.012,r0:0.0068,r1:0.0066}],
  build:function(){
   var g=new THREE.Group();
   g.add(mesh(lathe([[0,0],[0.021,0],[0.0228,0.012],[0.0230,0.20],[0.0218,0.40],
     [0.0205,0.44],[0.0208,0.455],[0.0196,0.70],[0.0200,0.715],[0.0186,0.735],
     [0.0150,1.05],[0.0105,1.30],[0.0079,1.42],[0.0070,1.452],[0,1.452]],26),MAT.wood));
   var wrap=mesh(new THREE.CylinderGeometry(0.0210,0.0216,0.255,22),
     M({color:0x14181E,roughnessMap:TX.grain,roughness:.85}));
   wrap.position.y=0.575;g.add(wrap);
   [0.443,0.712].forEach(function(y){
     var r=mesh(new THREE.CylinderGeometry(0.0212,0.0212,0.011,22),MAT.brass);r.position.y=y;g.add(r);});
   var fer=mesh(new THREE.CylinderGeometry(0.0069,0.0072,0.030,18),
     M({color:0xF2EDE0,roughness:.30,metalness:.02}));fer.position.y=1.452;g.add(fer);
   var tip=mesh(new THREE.CylinderGeometry(0.0067,0.0069,0.011,18),
     M({color:0x2F6FA8,roughness:.85}));tip.position.y=1.4725;g.add(tip);
   return g;}},

 {id:"garrafa",nome:"Long neck vazia",dens:1600,home:{p:[1.62,0.24,-0.55],r:[0,0.70,0]},
  parts:[
   {n:"bojo",t:"cyl",p:[0,0.085,0],a:[0,1,0],len:0.170,r0:0.0330,r1:0.0330},
   {n:"ombro",t:"cyl",p:[0,0.195,0],a:[0,1,0],len:0.050,r0:0.0330,r1:0.0132},
   {n:"gargalo",t:"cyl",p:[0,0.255,0],a:[0,1,0],len:0.070,r0:0.0132,r1:0.0126},
   {n:"bico",t:"cyl",p:[0,0.295,0],a:[0,1,0],len:0.010,r0:0.0155,r1:0.0155}],
  build:function(){
   var g=new THREE.Group();
   g.add(mesh(lathe([[0,0.006],[0.0250,0.001],[0.0305,0.004],[0.0328,0.016],[0.0334,0.055],
     [0.0334,0.150],[0.0330,0.172],[0.0312,0.190],[0.0258,0.212],[0.0184,0.232],
     [0.0142,0.246],[0.0130,0.258],[0.0128,0.282],[0.0142,0.288],[0.0156,0.293],
     [0.0150,0.300],[0.0112,0.300],[0.0106,0.290],[0,0.288]],30),MAT.glassG));
   var lb=mesh(new THREE.CylinderGeometry(0.0337,0.0337,0.078,30,1,true),MAT.label);
   lb.position.y=0.088;g.add(lb);
   var nk=mesh(new THREE.CylinderGeometry(0.0134,0.0134,0.028,20,1,true),
     M({color:0xB8302A,roughness:.7}));nk.position.y=0.266;g.add(nk);
   return g;}},

 {id:"cadeira",nome:"Cadeira do bar",dens:400,home:{p:[1.42,-0.78,1.02],r:[0,-0.75,0]},
  parts:[
   {n:"assento",t:"box",p:[0,0.450,0],s:[0.400,0.048,0.400]},
   {n:"encosto",t:"box",p:[0,0.730,-0.18],s:[0.380,0.500,0.042],dm:0.80},
   {n:"pé dianteiro esq.",t:"box",p:[-0.17,0.213,0.17],s:[0.042,0.426,0.042]},
   {n:"pé dianteiro dir.",t:"box",p:[0.17,0.213,0.17],s:[0.042,0.426,0.042]},
   {n:"pé traseiro esq.",t:"box",p:[-0.17,0.213,-0.17],s:[0.042,0.426,0.042]},
   {n:"pé traseiro dir.",t:"box",p:[0.17,0.213,-0.17],s:[0.042,0.426,0.042]}],
  build:function(){
   var g=new THREE.Group(),i;
   var legP=[[0,0],[0.024,0],[0.026,0.02],[0.021,0.09],[0.023,0.13],[0.019,0.24],
             [0.024,0.29],[0.020,0.35],[0.021,0.42],[0.019,0.426],[0,0.426]];
   [[-0.17,0.17],[0.17,0.17],[-0.17,-0.17],[0.17,-0.17]].forEach(function(p){
     var l=mesh(lathe(legP,14),MAT.woodDark);l.position.set(p[0],0,p[1]);g.add(l);});
   for(i=0;i<4;i++){ /* travessas */
     var a=[[-0.17,0.17,0.17,0.17],[0.17,0.17,0.17,-0.17],[0.17,-0.17,-0.17,-0.17],[-0.17,-0.17,-0.17,0.17]][i];
     var dx=a[2]-a[0],dz=a[3]-a[1],ln=Math.hypot(dx,dz);
     var t=mesh(new THREE.CylinderGeometry(0.013,0.013,ln,10),MAT.woodDark,
       (a[0]+a[2])/2,0.145,(a[1]+a[3])/2);
     t.rotation.z=Math.PI/2;t.rotation.y=-Math.atan2(dz,dx);g.add(t);}
   g.add(mesh(new THREE.BoxGeometry(0.40,0.030,0.40),MAT.wood,0,0.455,0));
   g.add(mesh(new THREE.BoxGeometry(0.372,0.020,0.372),MAT.wood,0,0.437,0));
   [-0.168,0.168].forEach(function(x){
     var p2=mesh(lathe([[0,0],[0.019,0],[0.017,0.10],[0.020,0.16],[0.016,0.44],[0.020,0.48],[0,0.49]],12),
       MAT.woodDark,x,0.470,-0.180);g.add(p2);});
   [0.62,0.76,0.90].forEach(function(y,k){
     var s=mesh(new THREE.BoxGeometry(0.336,0.052-k*0.006,0.020),MAT.woodDark,0,y,-0.180);g.add(s);});
   return g;}},

 {id:"vassoura",nome:"Vassoura de piaçava",dens:480,home:{p:[-1.68,-0.78,-0.70],r:[0.24,-0.55,0]},
  parts:[
   {n:"cerdas",t:"box",p:[0,0.045,0],s:[0.300,0.090,0.075],dm:0.45},
   {n:"cabo",t:"cyl",p:[0,0.690,0],a:[0,1,0],len:1.200,r0:0.0145,r1:0.0130}],
  build:function(){
   var g=new THREE.Group(),i;
   g.add(mesh(new THREE.BoxGeometry(0.300,0.052,0.070),MAT.woodPale,0,0.070,0));
   g.add(mesh(new THREE.BoxGeometry(0.306,0.014,0.076),MAT.steel,0,0.098,0));
   for(i=0;i<130;i++){
     var bx=(Math.random()-0.5)*0.288,bz=(Math.random()-0.5)*0.062;
     var ln=0.075+Math.random()*0.030;
     var b=mesh(new THREE.CylinderGeometry(0.0012,0.0021,ln,4),
       i%3?MAT.bristle:M({color:0x8A5E20,roughness:.95}),bx,0.046-(ln-0.09)/2,bz);
     b.rotation.z=(Math.random()-0.5)*0.24;b.rotation.x=(Math.random()-0.5)*0.30;
     b.castShadow=false;g.add(b);}
   g.add(mesh(lathe([[0,0.09],[0.0150,0.09],[0.0148,0.55],[0.0140,1.05],[0.0131,1.286],
     [0.0118,1.290],[0,1.290]],14),MAT.woodPale));
   g.add(mesh(new THREE.TorusGeometry(0.0135,0.0028,5,14),MAT.steel,0,1.272,0));
   return g;}},

 {id:"guardachuva",nome:"Guarda-chuva quebrado",dens:520,home:{p:[-1.55,-0.72,1.12],r:[0.12,-0.35,0.05]},
  parts:[
   {n:"cabo curvo",t:"cyl",p:[0,0.055,0],a:[0,1,0],len:0.110,r0:0.0125,r1:0.0125},
   {n:"haste",t:"cyl",p:[0,0.470,0],a:[0,1,0],len:0.720,r0:0.0110,r1:0.0092},
   {n:"copa",t:"cyl",p:[0,0.700,0],a:[0,1,0],len:0.230,r0:0.1150,r1:0.0180,dm:0.10},
   {n:"ponteira",t:"cyl",p:[0,0.860,0],a:[0,1,0],len:0.090,r0:0.0060,r1:0.0026}],
  build:function(){
   var g=new THREE.Group(),i;
   var crook=mesh(new THREE.TorusGeometry(0.042,0.0105,8,16,Math.PI*1.15),
     M({color:0x2A1C12,roughness:.55}),0,0.052,0);
   crook.rotation.y=Math.PI/2;crook.rotation.z=-0.35;g.add(crook);
   g.add(mesh(lathe([[0,0.075],[0.0110,0.080],[0.0106,0.45],[0.0098,0.72],[0.0092,0.83],[0,0.83]],14),MAT.steel));
   var canopy=mesh(lathe([[0.0180,0.815],[0.0400,0.790],[0.0680,0.752],[0.0920,0.706],
     [0.1080,0.652],[0.1152,0.600],[0.1120,0.586],[0.0900,0.616],[0.0640,0.652],[0.0380,0.686],[0.0175,0.706]],8),
     M({color:0x22355C,roughness:.90,metalness:0,side:THREE.DoubleSide}));
   g.add(canopy);
   for(i=0;i<8;i++){
     var a=i/8*TAU+Math.PI/8;
     var rib=mesh(new THREE.CylinderGeometry(0.0018,0.0012,0.128,5),MAT.steel,
       Math.cos(a)*0.066,0.700,Math.sin(a)*0.066);
     rib.rotation.z=Math.cos(a)*0.95;rib.rotation.x=-Math.sin(a)*0.95;
     rib.castShadow=false;g.add(rib);}
   g.add(mesh(new THREE.CylinderGeometry(0.0160,0.0195,0.030,14),MAT.steel,0,0.828,0));
   g.add(mesh(lathe([[0,0.815],[0.0062,0.822],[0.0050,0.870],[0.0026,0.903],[0,0.905]],12),MAT.chrome));
   return g;}}
];

/* ══ ANÁLISE: onde fica a ponta ══ */
function cloud(o){
  var pts=[];
  o.parts.forEach(function(pt){
    var dens=o.dens*(pt.dm||1);
    if(pt.t==="cyl"){
      var N=14,ax=new V3(pt.a[0],pt.a[1],pt.a[2]).normalize();
      for(var i=0;i<N;i++){
        var f=(i+0.5)/N,off=(f-0.5)*pt.len,r=pt.r0+(pt.r1-pt.r0)*f;
        pts.push({v:new V3(pt.p[0],pt.p[1],pt.p[2]).addScaledVector(ax,off),
                  r:r,m:Math.PI*r*r*(pt.len/N)*dens,n:pt.n});}
    }else{
      var s=pt.s,li=s[0]>=s[1]&&s[0]>=s[2]?0:(s[1]>=s[2]?1:2);
      var ot=[0,1,2].filter(function(k){return k!==li;});
      var rr=(s[ot[0]]+s[ot[1]])*0.25,Mx=12,vol=s[0]*s[1]*s[2]*dens;
      for(var j=0;j<Mx;j++){
        var gq=(j+0.5)/Mx,d=(gq-0.5)*s[li],w=new V3(pt.p[0],pt.p[1],pt.p[2]);
        if(li===0)w.x+=d;else if(li===1)w.y+=d;else w.z+=d;
        pts.push({v:w,r:rr,m:vol/Mx,n:pt.n});}}
  });
  return pts;
}
function principalAxis(pts,c){
  var C=[[0,0,0],[0,0,0],[0,0,0]],Mt=0,i,j;
  pts.forEach(function(p){
    var d=[p.v.x-c.x,p.v.y-c.y,p.v.z-c.z];
    for(i=0;i<3;i++)for(j=0;j<3;j++)C[i][j]+=p.m*d[i]*d[j];
    Mt+=p.m;});
  for(i=0;i<3;i++)for(j=0;j<3;j++)C[i][j]/=Mt;
  var v=[0.31,0.83,0.46];
  for(var k=0;k<64;k++){
    var n=[C[0][0]*v[0]+C[0][1]*v[1]+C[0][2]*v[2],
           C[1][0]*v[0]+C[1][1]*v[1]+C[1][2]*v[2],
           C[2][0]*v[0]+C[2][1]*v[1]+C[2][2]*v[2]];
    var L=Math.hypot(n[0],n[1],n[2])||1;v=[n[0]/L,n[1]/L,n[2]/L];}
  return new V3(v[0],v[1],v[2]).normalize();
}
function analyze(o){
  var pts=cloud(o),m=0,c=new V3();
  pts.forEach(function(p){c.addScaledVector(p.v,p.m);m+=p.m;});
  c.multiplyScalar(1/m);
  var u=principalAxis(pts,c),tmin=1e9,tmax=-1e9,rmax=0;
  pts.forEach(function(p){
    p.t=p.v.clone().sub(c).dot(u);
    p.perp=p.v.clone().sub(c).addScaledVector(u,-p.t).length();
    if(p.perp+p.r>rmax)rmax=p.perp+p.r;
    if(p.t<tmin)tmin=p.t;if(p.t>tmax)tmax=p.t;});
  var len=tmax-tmin;
  function endInfo(dir){
    var win=Math.max(len*0.045,0.006);
    var sel=pts.filter(function(p){return dir>0?p.t>=tmax-win:p.t<=tmin+win;});
    if(!sel.length)sel=[dir>0?pts[pts.length-1]:pts[0]];
    var bp=sel[0];sel.forEach(function(p){if(p.r<bp.r)bp=p;});
    return {r:bp.r,name:bp.n,v:bp.v};}
  var A=endInfo(1),B=endInfo(-1),up=A.r<=B.r,tip=up?A:B;
  var axis=up?u.clone():u.clone().negate();
  var tipPoint=tip.v.clone();
  var perp=0,pw=0,meanR=0;
  pts.forEach(function(p){perp+=p.perp*p.m;meanR+=p.r*p.m;pw+=p.m;});
  perp/=pw;meanR/=pw;
  var spread=perp/Math.max(len,1e-4);
  var slender=len/Math.max(2*meanR,1e-4);
  var sl=(Math.log(Math.max(slender,1.2))-Math.log(3))/(Math.log(55)-Math.log(3));
  /* Qual lado do objeto deve ficar virado para o pano?
     Função de suporte perpendicular: para cada direção ao redor do eixo,
     mede o quanto o corpo se estende naquele lado a partir da ponta.
     A direção de MENOR extensão é a que aponta para baixo — é assim que
     uma pessoa vira uma cadeira para usar uma perna como taco. */
  var e1=new V3(0,1,0);
  if(Math.abs(axis.y)>0.9)e1.set(1,0,0);
  e1.addScaledVector(axis,-e1.dot(axis)).normalize();
  var e2=new V3().crossVectors(axis,e1).normalize();
  var perps=pts.map(function(p){
    var q2=p.v.clone().sub(tipPoint);
    q2.addScaledVector(axis,-q2.dot(axis));
    return {a:q2.dot(e1),b:q2.dot(e2),r:p.r};});
  var bestH=1e9,bestPhi=0;
  for(var ph=0;ph<72;ph++){
    var an2=ph/72*Math.PI*2,ux=Math.cos(an2),uz=Math.sin(an2),hh=-1e9;
    for(var pi=0;pi<perps.length;pi++){
      var q3=perps[pi],dd=q3.a*ux+q3.b*uz+q3.r;
      if(dd>hh)hh=dd;}
    if(hh<bestH){bestH=hh;bestPhi=an2;}}
  var downDir=e1.clone().multiplyScalar(Math.cos(bestPhi)).addScaledVector(e2,Math.sin(bestPhi));
  var down=Math.max(0,bestH);
  var elev=Math.asin(Math.min(0.72,(0.092+down)/Math.max(len*0.55,0.15)));
  return {axis:axis,tipPoint:tipPoint,tipName:tip.name,tipR:tip.r,len:len,mass:m,rmax:rmax,
    downDir:downDir,down:down,
    elev:Math.max(0.09,Math.min(0.72,elev)),
    precisao:Math.max(0.10,Math.min(1,1-(tip.r-0.0035)/0.042)),
    controle:Math.max(0.08,Math.min(1,sl-spread*2.2)),
    potencia:Math.max(0.12,Math.min(1,0.10+m*0.30+len*0.22))};
}
OBJECTS.forEach(function(o){o.an=analyze(o);});

/* ══ TRALHA ══ */
var JUNK=[
 {id:"bota",nome:"Galocha",r:0.078,half:[0.060,0.128,0.148],mass:5.5,build:function(){
   var g=new THREE.Group();
   /* solado com contorno de pé, borda arredondada */
   var sole=mesh(footSlab(1.06,0.030,0.008),MAT.bootSole,0,-0.112,0.010);g.add(sole);
   for(var i=0;i<8;i++){                                   /* relevo do solado */
     var tr=mesh(new THREE.BoxGeometry(0.098-Math.abs(i-3.5)*0.006,0.007,0.016),
       M({color:0x0B0D10,roughness:.95,envMap:envMap}),0,-0.130,-0.092+i*0.030);
     tr.castShadow=false;g.add(tr);}
   /* pé: elipsoide alongado */
   var foot=mesh(new THREE.SphereGeometry(0.056,20,14),MAT.bootRub,0,-0.070,0.030);
   foot.scale.set(0.92,0.80,1.72);g.add(foot);
   /* peito do pé subindo para o cano */
   var inst=mesh(new THREE.SphereGeometry(0.052,18,14),MAT.bootRub,0,-0.036,-0.040);
   inst.scale.set(0.95,1.15,1.05);g.add(inst);
   /* cano levemente cônico */
   g.add(mesh(new THREE.CylinderGeometry(0.052,0.058,0.185,20,1,false),MAT.bootRub,0,0.028,-0.056));
   /* cano com dobra na boca */
   g.add(mesh(new THREE.TorusGeometry(0.053,0.0085,9,22),MAT.bootRub,0,0.118,-0.056));
   /* faixa de reforço no tornozelo */
   var band=mesh(new THREE.CylinderGeometry(0.0545,0.0555,0.020,20),
     M({color:0xC8A83A,roughness:.5,metalness:.15,envMap:envMap}),0,-0.048,-0.056);g.add(band);
   /* costura do solado */
   g.add(mesh(new THREE.TorusGeometry(0.061,0.0026,6,26),
     M({color:0x2A2C30,roughness:.8,envMap:envMap}),0,-0.096,0.010).rotateX(Math.PI/2));
   return g;}},
 {id:"tenis",nome:"Tênis furado",r:0.068,half:[0.050,0.058,0.148],mass:3.0,build:function(){
   var g=new THREE.Group();
   var s=mesh(new THREE.BoxGeometry(0.092,0.026,0.268),M({color:0xE6E2D4,roughness:.85}),0,-0.038,0);g.add(s);
   var st=mesh(new THREE.BoxGeometry(0.094,0.012,0.270),M({color:0xB9B4A4,roughness:.9}),0,-0.050,0);g.add(st);
   g.add(mesh(new THREE.BoxGeometry(0.086,0.052,0.190),MAT.canvasW,0,-0.002,0.024));
   var hl=mesh(new THREE.BoxGeometry(0.076,0.062,0.086),M({color:0x2C5A9E,roughness:.85}),0,0.006,-0.086);g.add(hl);
   var toe2=mesh(new THREE.SphereGeometry(0.046,14,10),MAT.canvasW,0,-0.012,0.114);
   toe2.scale.set(1,0.62,0.80);g.add(toe2);
   for(var i=0;i<4;i++)g.add(mesh(new THREE.BoxGeometry(0.052,0.006,0.008),
     M({color:0xF4F1E6,roughness:.7}),0,0.026-i*0.002,-0.030+i*0.026));
   return g;}},
 {id:"chinelo",nome:"Chinelo",r:0.058,half:[0.058,0.020,0.148],mass:1.2,build:function(){
   var g=new THREE.Group();
   g.add(mesh(footSlab(1.00,0.016,0.005),MAT.flipSole,0,-0.004,0));   /* sola azul */
   g.add(mesh(footSlab(0.96,0.008,0.004),MAT.flipFoam,0,0.010,0));    /* palmilha clara */
   /* tira em Y: dois ramos até os lados e o pino entre os dedos */
   [[-1],[1]].forEach(function(sd){
     var st=mesh(new THREE.CylinderGeometry(0.0062,0.0062,0.092,9),MAT.strap,
       sd[0]*0.030,0.028,-0.016);
     st.rotation.z=sd[0]*0.72;st.rotation.x=-0.62;g.add(st);
     g.add(mesh(new THREE.SphereGeometry(0.0075,9,7),MAT.strap,sd[0]*0.050,0.008,-0.030));
   });
   g.add(mesh(new THREE.SphereGeometry(0.0165,12,10),MAT.strap,0,0.050,0.026));
   g.add(mesh(new THREE.CylinderGeometry(0.0055,0.0068,0.052,9),MAT.strap,0,0.026,0.056));
   g.add(mesh(new THREE.SphereGeometry(0.0072,9,7),MAT.strap,0,0.006,0.070));
   return g;}},
 {id:"copo",nome:"Copo americano",r:0.038,half:[0.038,0.046,0.038],mass:2.4,build:function(){
   var g=new THREE.Group();
   g.add(mesh(lathe([[0,-0.046],[0.028,-0.046],[0.030,-0.038],[0.0335,0.010],[0.0375,0.046],
     [0.0345,0.046],[0.0305,0.006],[0.0262,-0.030],[0,-0.032]],26),MAT.glassC));
   return g;}},
 {id:"lata",nome:"Lata amassada",r:0.034,half:[0.034,0.060,0.026],mass:1.4,build:function(){
   var g=new THREE.Group();
   var b=mesh(lathe([[0,-0.058],[0.026,-0.060],[0.032,-0.050],[0.0330,-0.030],
     [0.0300,0.010],[0.0330,0.040],[0.0320,0.052],[0.0270,0.060],[0,0.058]],20),MAT.tinRed);
   b.scale.z=0.76;g.add(b);
   g.add(mesh(new THREE.TorusGeometry(0.0272,0.0026,5,16),MAT.steel,0,0.058,0));
   return g;}},
 {id:"laranja",nome:"Laranja",r:0.043,half:[0.043,0.043,0.043],mass:1.3,build:function(){
   var g=new THREE.Group();
   var s=mesh(new THREE.SphereGeometry(0.043,20,14),MAT.orange);s.scale.y=0.94;g.add(s);
   g.add(mesh(new THREE.CylinderGeometry(0.004,0.0055,0.014,6),M({color:0x4A5A22,roughness:.95}),0,0.042,0));
   return g;}},
 {id:"cinzeiro",nome:"Cinzeiro",r:0.060,half:[0.060,0.024,0.060],mass:9.0,build:function(){
   var g=new THREE.Group();
   g.add(mesh(lathe([[0,-0.022],[0.052,-0.022],[0.058,-0.012],[0.0600,0.016],[0.0560,0.022],
     [0.0430,0.010],[0.0400,-0.008],[0,-0.010]],26),MAT.glassC));
   return g;}},
 {id:"pedra",nome:"Pedra do jardim",r:0.055,half:[0.055,0.042,0.050],mass:14.0,build:function(){
   var gm=new THREE.IcosahedronGeometry(0.052,2),p=gm.attributes.position;
   for(var i=0;i<p.count;i++){
     var x=p.getX(i),y=p.getY(i),z=p.getZ(i);
     /* ruído suave por direção: rocha lisa e bojuda, sem espinhos */
     var n=Math.sin(x*58)*0.34+Math.cos(y*47+0.9)*0.34+Math.sin(z*63+2.1)*0.32;
     var f=1+n*0.11;
     p.setXYZ(i,x*f*1.06,y*f*0.80,z*f*0.97);}
   gm.computeVertexNormals();
   var g=new THREE.Group();g.add(mesh(gm,MAT.stone));return g;}},
 {id:"livro",nome:"Lista telefônica",r:0.082,half:[0.078,0.032,0.104],mass:6.0,build:function(){
   var g=new THREE.Group();
   g.add(mesh(new THREE.BoxGeometry(0.150,0.050,0.200),M({color:0xE9E2CC,roughness:.97})));
   g.add(mesh(new THREE.BoxGeometry(0.156,0.010,0.206),M({color:0x8C3A2E,roughness:.86}),0,0.029,0));
   g.add(mesh(new THREE.BoxGeometry(0.156,0.010,0.206),M({color:0x8C3A2E,roughness:.86}),0,-0.029,0));
   g.add(mesh(new THREE.BoxGeometry(0.012,0.062,0.206),M({color:0x7A3126,roughness:.86}),-0.078,0,0));
   return g;}}
];
