/* ══ CENA ══ */
var scene,cam,renderer,ray,plane,envMap;
var ballMesh=[],homeGroups={},markers={},junkPool=[],pickables=[],G=null,hovered=null;
var aimLine,ghost,foeAim,neonL,arcLine,arcRing,objLine,defLine,objDot;

function isolate(g){
  var map={};
  g.traverse(function(n){
    if(n.isMesh&&n.material){
      var k=n.material.uuid;
      if(!map[k])map[k]=n.material.clone();
      n.material=map[k];}});
  g.userData.mats=Object.keys(map).map(function(k){return map[k];});
}
function glow(g,on){
  var ms=g.userData.mats;if(!ms)return;
  for(var i=0;i<ms.length;i++)if(ms[i].emissive)ms[i].emissive.setHex(on?0x123A4E:0x000000);
}
function makeEnv(){
  var pm=new THREE.PMREMGenerator(renderer);pm.compileEquirectangularShader();
  var s=new THREE.Scene();s.background=new THREE.Color(0x0B0D12);
  function panel(c,w,ht,d,px,py,pz,rx,ry){
    var m=new THREE.Mesh(new THREE.BoxGeometry(w,ht,d),new THREE.MeshBasicMaterial({color:c}));
    m.position.set(px,py,pz);if(rx)m.rotation.x=rx;if(ry)m.rotation.y=ry;s.add(m);}
  panel(0xFFE2B4,1.5,0.05,1.5, 0, 2.6, 0);      /* luminária */
  panel(0x3A2E22,12,0.1,12,    0,-1.0, 0);      /* chão */
  panel(0xFF2E6E,1.2,0.7,0.05,-2.2,1.2,-4.4);   /* neon rosa */
  panel(0x1FBF6A,0.5,0.7,0.05, 2.6,1.2,-4.4);   /* neon verde */
  panel(0x2A2418,8,3.6,0.1,    0, 0.8,-4.6);
  panel(0x1C1A16,0.1,3.6,9,   -3.4,0.8, 0);
  panel(0x1C1A16,0.1,3.6,9,    3.4,0.8, 0);
  var t=pm.fromScene(s,0.035).texture;pm.dispose();return t;
}
function buildBar(){
  var g=new THREE.Group(),i,j;
  var RX=3.4,RZB=-4.6,RZF=4.0,CY=3.0;
  var fl=new THREE.Mesh(new THREE.PlaneGeometry(RX*2,RZF-RZB),MAT.tile);
  fl.rotation.x=-Math.PI/2;fl.position.set(0,FLOOR,(RZB+RZF)/2);fl.receiveShadow=true;g.add(fl);
  function wall(w,ht,px,py,pz,ry){
    var m=new THREE.Mesh(new THREE.PlaneGeometry(w,ht),MAT.wall);
    m.position.set(px,py,pz);m.rotation.y=ry||0;m.receiveShadow=true;g.add(m);}
  wall(RX*2,CY-FLOOR,0,(FLOOR+CY)/2,RZB,0);
  wall(RZF-RZB,CY-FLOOR,-RX,(FLOOR+CY)/2,(RZB+RZF)/2,Math.PI/2);
  wall(RZF-RZB,CY-FLOOR,RX,(FLOOR+CY)/2,(RZB+RZF)/2,-Math.PI/2);
  g.add(mesh(new THREE.BoxGeometry(RX*2,0.98,0.04),
    M({map:TX.wood,color:0x1E4038,roughness:.72,envMap:envMap}),0,FLOOR+0.49,RZB+0.03));
  g.add(mesh(new THREE.BoxGeometry(RX*2,0.05,0.06),MAT.woodDark,0,FLOOR+1.00,RZB+0.05));

  /* balcão */
  g.add(mesh(new THREE.BoxGeometry(4.4,0.09,0.66),MAT.rail,0,FLOOR+1.06,-2.95));
  g.add(mesh(new THREE.BoxGeometry(4.3,1.02,0.50),MAT.woodDark,0,FLOOR+0.51,-3.05));
  for(i=0;i<8;i++)g.add(mesh(new THREE.BoxGeometry(0.05,1.00,0.05),MAT.wood,-1.96+i*0.56,FLOOR+0.50,-2.76));
  g.add(mesh(new THREE.BoxGeometry(4.3,0.05,0.30),MAT.steel,0,FLOOR+0.18,-3.14));

  /* prateleiras com garrafas */
  for(var sh=0;sh<2;sh++){
    g.add(mesh(new THREE.BoxGeometry(3.6,0.045,0.26),MAT.woodDark,-0.2,FLOOR+1.74+sh*0.48,RZB+0.16));
    for(i=0;i<14;i++){
      var col=[0x2C5A2E,0x6B3A18,0x1E2E44,0x7A2020,0x4A3A16,0x2A2A2A][i%6];
      var bt=mesh(lathe([[0,0],[0.030,0.002],[0.032,0.012],[0.031,0.135],[0.020,0.175],
        [0.0125,0.200],[0.0122,0.246],[0.0145,0.252],[0,0.252]],12),
        M({color:col,roughness:.10,metalness:0,transparent:true,opacity:.72,envMap:envMap,envMapIntensity:1.8}),
        -1.86+i*0.26+(sh?0.11:0),FLOOR+1.762+sh*0.48,RZB+0.16+(Math.random()-0.5)*0.05);
      bt.rotation.y=Math.random()*TAU;g.add(bt);}
  }
  /* banquetas */
  [[-2.1,-2.25],[-1.42,-2.30],[1.55,-2.22]].forEach(function(p){
    var sg=new THREE.Group();
    sg.add(mesh(lathe([[0,0.62],[0.155,0.62],[0.162,0.635],[0.158,0.665],[0,0.668]],18),
      M({color:0x5A2018,roughnessMap:TX.grain,roughness:.62,envMap:envMap})));
    for(i=0;i<3;i++){
      var a=i/3*TAU+0.4;
      var lg=mesh(new THREE.CylinderGeometry(0.014,0.017,0.63,8),MAT.steel,
        Math.cos(a)*0.115,0.315,Math.sin(a)*0.115);
      lg.rotation.z=-Math.cos(a)*0.11;lg.rotation.x=Math.sin(a)*0.11;sg.add(lg);}
    sg.add(mesh(new THREE.TorusGeometry(0.115,0.008,6,18),MAT.steel,0,0.20,0));
    sg.position.set(p[0],FLOOR,p[1]);g.add(sg);});

  /* mesa alta ao lado da sinuca (onde fica a garrafa) */
  var pt=new THREE.Group();
  pt.add(mesh(lathe([[0,0.98],[0.28,0.98],[0.285,0.995],[0.278,1.02],[0,1.02]],24),MAT.rail));
  pt.add(mesh(new THREE.CylinderGeometry(0.032,0.038,0.98,12),MAT.steel,0,0.49,0));
  pt.add(mesh(lathe([[0,0],[0.20,0],[0.205,0.018],[0,0.022]],20),MAT.steel));
  pt.position.set(1.62,FLOOR,-0.55);g.add(pt);

  /* porta-guarda-chuva */
  g.add(mesh(lathe([[0,0],[0.115,0],[0.118,0.012],[0.112,0.40],[0.100,0.40],[0.104,0.012],[0,0.008]],16),
    M({color:0x3A3128,roughnessMap:TX.grain,roughness:.85,envMap:envMap}),-1.55,FLOOR,1.12));

  /* neon */
  var nz=new THREE.Group();
  [[0,0,0.36,0.055],[0,0.18,0.055,0.32],[0.24,0,0.055,0.32],[0.24,-0.15,0.32,0.055]].forEach(function(s){
    nz.add(new THREE.Mesh(new THREE.BoxGeometry(s[2],s[3],0.028),
      new THREE.MeshBasicMaterial({color:0xFF4E86})).translateX(s[0]).translateY(s[1]));});
  nz.position.set(-2.35,FLOOR+2.0,RZB+0.07);g.add(nz);
  neonL=new THREE.PointLight(0xFF2E6E,1.4,3.8);neonL.position.set(-2.2,FLOOR+2.0,RZB+0.4);g.add(neonL);
  var grn=new THREE.Mesh(new THREE.BoxGeometry(0.30,0.46,0.026),new THREE.MeshBasicMaterial({color:0x3BE08C}));
  grn.position.set(2.6,FLOOR+1.9,RZB+0.07);g.add(grn);
  var gl2=new THREE.PointLight(0x1FBF6A,0.7,2.6);gl2.position.set(2.55,FLOOR+1.85,RZB+0.32);g.add(gl2);

  /* cartazes e engradados */
  [[-1.2,0x7E2C22],[-0.6,0x24485F],[0.55,0x5E5220]].forEach(function(pp,k){
    var po=mesh(new THREE.BoxGeometry(0.48,0.68,0.012),
      M({color:pp[1],map:TX.wall,roughness:.95,envMap:envMap}),pp[0],FLOOR+1.78,RZB+0.04);
    po.rotation.z=(k-1)*0.028;g.add(po);});
  [[-2.9,-3.9,0],[-2.9,-3.9,0.32],[-2.5,-3.85,0]].forEach(function(cr){
    var c2=mesh(new THREE.BoxGeometry(0.42,0.31,0.31),
      M({map:TX.wood,color:0x8A5424,roughness:.92,envMap:envMap}),cr[0],FLOOR+0.155+cr[2],cr[1]);
    c2.rotation.y=Math.random()*0.4;g.add(c2);});
  g.add(mesh(lathe([[0,0],[0.19,0],[0.195,0.02],[0.165,0.44],[0,0.45]],14),
    M({color:0x2E3A2C,roughness:.9,envMap:envMap}),2.90,FLOOR,1.90));

  for(i=0;i<20;i++){
    var deb=mesh(new THREE.CylinderGeometry(0.028,0.030,0.055,8),
      M({color:0x8A5A30,roughness:.9,metalness:.3,envMap:envMap}));
    var ax=(Math.random()*2-1)*3.0,az=-4.2+Math.random()*7.8;
    if(Math.abs(ax)<1.05&&az>-1.7&&az<1.7)ax+=(ax>=0?1:-1)*1.4;
    deb.position.set(ax,FLOOR+0.014,az);deb.rotation.set(Math.PI/2,Math.random()*TAU,0);
    deb.castShadow=false;g.add(deb);}
  return g;
}

function ballTex(num,col,striped){
  var c=cvs(256,128),x=c.getContext("2d");
  x.fillStyle=striped?"#F4F0E4":col;x.fillRect(0,0,256,128);
  if(striped){x.fillStyle=col;x.fillRect(0,28,256,72);}
  [64,192].forEach(function(cx){
    x.beginPath();x.arc(cx,64,27,0,TAU);x.fillStyle="#F9F6EC";x.fill();
    x.fillStyle="#15171B";x.font="bold 34px Helvetica,Arial";x.textAlign="center";x.textBaseline="middle";
    x.fillText(String(num),cx,66);});
  var t=new THREE.CanvasTexture(c);t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t;
}

function initScene(){
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  document.getElementById("gl").appendChild(renderer.domElement);

  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x080A0D);
  scene.fog=new THREE.Fog(0x080A0D,6.5,14);
  cam=new THREE.PerspectiveCamera(46,1,0.08,60);

  buildTextures();
  envMap=makeEnv();
  scene.environment=envMap;
  buildMaterials(envMap);

  scene.add(new THREE.AmbientLight(0x3A4757,0.62));
  scene.add(new THREE.HemisphereLight(0x5A6E84,0x1A1714,0.55));
  var evenly=new THREE.DirectionalLight(0xFFE8CC,0.42);
  evenly.position.set(0.2,4,0.9);scene.add(evenly);
  var lamp=new THREE.SpotLight(0xFFE2BA,1.85,12,1.05,0.95,0.75);
  lamp.position.set(0,2.42,0);lamp.target.position.set(0,0,0);
  lamp.castShadow=true;lamp.shadow.mapSize.set(2048,2048);
  lamp.shadow.camera.near=0.4;lamp.shadow.camera.far=6;
  lamp.shadow.bias=-0.0004;lamp.shadow.normalBias=0.012;
  scene.add(lamp);scene.add(lamp.target);
  var back=new THREE.PointLight(0xFFC178,1.1,6.5);back.position.set(0,FLOOR+1.95,-2.7);scene.add(back);

  var shade=mesh(lathe([[0.030,0.30],[0.036,0.28],[0.34,0.02],[0.345,0.0],[0.335,0.0],[0.028,0.275]],22),
    M({color:0x24282E,roughness:.42,metalness:.55,envMap:envMap,side:THREE.DoubleSide}),0,2.36,0);
  scene.add(shade);
  scene.add(mesh(new THREE.CylinderGeometry(0.006,0.006,0.34,6),M({color:0x141619,roughness:.9}),0,2.83,0));
  var bulb=new THREE.Mesh(new THREE.SphereGeometry(0.052,14,10),new THREE.MeshBasicMaterial({color:0xFFEBC8}));
  bulb.position.set(0,2.44,0);scene.add(bulb);

  scene.add(buildBar());
  makePerson({nome:"Seu Waldir",p:[0.55,FLOOR+0.84,-3.34],ry:0.10,legs:1,wipe:1,apron:1,
    skin:0xB5825C,shirt:0xE4E0D2,pants:0x2A2E36,hair:0x2A2018,beard:1,
    lines:["Ô! Tá maluco?!","Aqui não, rapaz!","Quebrou, pagou!"]});
  makePerson({nome:"o bêbado do balcão",p:[1.55,FLOOR+0.665,-2.28],ry:3.02,legs:1,seated:1,
    bottle:1,skin:0x9C6E4A,shirt:0x8A3B2E,pants:0x22364E,hair:0x14100C,cap:0x35424E,
    lines:["Ô!!! Cê tá cego?!","Perdeu a mão, foi?","Tava quieto aqui, ó!"]});

  /* mesa */
  var fsh=new THREE.Shape();
  var FX=HW+0.082,FZ=HL+0.082;   /* termina rente à borda externa da tabela */
  fsh.moveTo(-FX,-FZ);fsh.lineTo(FX,-FZ);fsh.lineTo(FX,FZ);fsh.lineTo(-FX,FZ);fsh.closePath();
  POCKETS.forEach(function(p){
    var hole=new THREE.Path();
    hole.absarc(p.x,-p.z,POCK*0.97,0,TAU,true);
    fsh.holes.push(hole);});
  var fgeo=new THREE.ExtrudeGeometry(fsh,{depth:0.018,bevelEnabled:false,curveSegments:22});
  fgeo.rotateX(-Math.PI/2);
  fgeo.translate(0,-0.018,0);       /* topo em y=0; 18mm de espessura fica atrás da tabela */
  var felt=mesh(fgeo,MAT.felt,0,0,0);
  felt.castShadow=true;scene.add(felt);   /* bloqueia a luz: a sombra da bola fica no pano */

  var RH=0.066,RW=0.082,GAP=POCK+0.022;
  var segL=HL-2*GAP,segS=2*(HW-GAP);
  [-1,1].forEach(function(sx3){
    [-1,1].forEach(function(sz3){                      /* quatro trechos longos */
      scene.add(mesh(new THREE.BoxGeometry(RW,RH,segL),MAT.rail,
        sx3*(HW+RW/2),RH/2-0.02,sz3*(GAP+segL/2)));});
    scene.add(mesh(new THREE.BoxGeometry(segS,RH,RW),MAT.rail,      /* dois trechos curtos */
      0,RH/2-0.02,sx3*(HL+RW/2)));});
  /* cantoneiras de latão nas bocas das caçapas */
  POCKETS.forEach(function(p){
    var ang=Math.atan2(p.z,p.x);
    [-1,1].forEach(function(sd2){
      var a2=(p.z===0?(p.x>0?0:Math.PI):ang)+sd2*(p.z===0?Math.PI/2:0.72);
      var cx=p.x+Math.cos(a2)*(POCK+0.012),cz=p.z+Math.sin(a2)*(POCK+0.012);
      if(Math.abs(cx)>HW+RW+0.02||Math.abs(cz)>HL+RW+0.02)return;
      scene.add(mesh(new THREE.SphereGeometry(0.019,12,10),MAT.brass,cx,RH-0.024,cz));});});
  [[-HW-RW/2,HL+RW/2],[HW+RW/2,HL+RW/2],[-HW-RW/2,-HL-RW/2],[HW+RW/2,-HL-RW/2]].forEach(function(p){
    scene.add(mesh(new THREE.SphereGeometry(0.026,12,10),MAT.brass,p[0],RH-0.020,p[1]));});
  /* saia em vigas separadas: deixa os cantos livres para a rede aparecer */
  [-1,1].forEach(function(sx2){
    [-1,1].forEach(function(sz2){
      scene.add(mesh(new THREE.BoxGeometry(RW+0.032,0.235,HL-0.28),MAT.woodDark,
        sx2*(HW+RW/2),-0.1375,sz2*(HL/2)));});
    scene.add(mesh(new THREE.BoxGeometry(HW*2-0.26,0.235,RW+0.032),MAT.woodDark,
      0,-0.1375,sx2*(HL+RW/2)));});
  /* pernas: base no piso, topo entrando na saia; alinhadas sob as vigas longas */
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(l){
    var lx=l[0]*(HW+RW/2),lz=l[1]*0.88;   /* perto das pontas, sob a viga longa */
    scene.add(mesh(lathe([[0,0],[0.086,0],[0.090,0.028],[0.060,0.130],[0.052,0.300],
      [0.074,0.430],[0.064,0.500],[0.060,0.528],[0,0.530]],16),MAT.woodDark,lx,FLOOR,lz));
    /* sapata de latão no pé */
    scene.add(mesh(new THREE.CylinderGeometry(0.090,0.086,0.020,16),MAT.brass,lx,FLOOR+0.010,lz));});
  POCKETS.forEach(function(p){
    var thr=mesh(new THREE.CylinderGeometry(POCK*0.99,POCK*0.82,0.075,24,1,true),
      M({color:0x08090C,roughness:.98,side:THREE.DoubleSide,envMap:envMap}),p.x,-0.026,p.z);
    thr.castShadow=false;scene.add(thr);
    /* disco preto no fundo da garganta: marca a caçapa vista de cima */
    var fd=mesh(new THREE.CircleGeometry(POCK*0.86,24),
      new THREE.MeshBasicMaterial({color:0x05070A}),p.x,-0.061,p.z);
    fd.rotation.x=-Math.PI/2;fd.castShadow=false;scene.add(fd);
    scene.add(mesh(new THREE.TorusGeometry(POCK*0.99,0.0062,8,28),MAT.brass,p.x,-0.001,p.z)
      .rotateX(Math.PI/2));
    var col=mesh(new THREE.TorusGeometry(POCK*0.90,0.0060,7,24),
      M({color:0x5C4526,roughnessMap:TX.grain,roughness:.72,envMap:envMap}),p.x,-0.034,p.z);
    col.rotateX(Math.PI/2);scene.add(col);
    var net=mesh(new THREE.CylinderGeometry(POCK*0.90,POCK*0.56,0.108,20,4,true),
      MAT.net,p.x,-0.090,p.z);
    net.castShadow=false;scene.add(net);
    var bag=mesh(new THREE.SphereGeometry(POCK*0.56,18,12,0,TAU,Math.PI*0.5,Math.PI*0.5),
      MAT.net,p.x,-0.144,p.z);
    bag.castShadow=false;scene.add(bag);});

  /* bolas */
  var bg=new THREE.SphereGeometry(BR,26,18);
  for(var i=0;i<15;i++){
    var mt=i===0?M({color:0xF7F3E9,roughness:.10,metalness:.02,envMap:envMap,envMapIntensity:1.4})
                :M({map:ballTex(i,BCOL[i-1],i>7),roughness:.10,metalness:.02,envMap:envMap,envMapIntensity:1.4});
    var mm=mesh(bg,mt,0,BR,0);scene.add(mm);ballMesh.push(mm);
  }

  /* objetos do cenário */
  OBJECTS.forEach(function(o){
    var inner=o.build();isolate(inner);
    inner.traverse(function(n){if(n.isMesh)n.userData.owner={kind:"cue",id:o.id};});
    var wrap=new THREE.Group();wrap.add(inner);
    wrap.userData.inner=inner;wrap.userData.mats=inner.userData.mats;wrap.userData.obj=o;
    scene.add(wrap);homeGroups[o.id]=wrap;pickables.push(wrap);
    var mk=new THREE.Mesh(new THREE.RingGeometry(0.085,0.115,26),
      new THREE.MeshBasicMaterial({color:0xD9A441,transparent:true,opacity:.22,side:THREE.DoubleSide}));
    mk.rotation.x=-Math.PI/2;scene.add(mk);markers[o.id]=mk;
  });

  var lg1=new THREE.BufferGeometry();
  lg1.setAttribute("position",new THREE.BufferAttribute(new Float32Array(6),3));
  aimLine=new THREE.Line(lg1,new THREE.LineBasicMaterial({color:0xF0E9DB,transparent:true,opacity:.5}));
  scene.add(aimLine);
  var lg2=new THREE.BufferGeometry();
  lg2.setAttribute("position",new THREE.BufferAttribute(new Float32Array(6),3));
  foeAim=new THREE.Line(lg2,new THREE.LineBasicMaterial({color:0xFF6B3D,transparent:true,opacity:.55}));
  scene.add(foeAim);
  var lg3=new THREE.BufferGeometry();
  lg3.setAttribute("position",new THREE.BufferAttribute(new Float32Array(32*3),3));
  arcLine=new THREE.Line(lg3,new THREE.LineBasicMaterial({color:0x7FD4E8,transparent:true,opacity:.75}));
  arcLine.visible=false;scene.add(arcLine);
  arcRing=new THREE.Mesh(new THREE.TorusGeometry(0.075,0.0045,7,26),
    new THREE.MeshBasicMaterial({color:0x7FD4E8,transparent:true,opacity:.8}));
  arcRing.rotation.x=Math.PI/2;arcRing.visible=false;scene.add(arcRing);
  function predLine(col,op,w){
    var g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(6),3));
    var l=new THREE.Line(g,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op}));
    l.visible=false;scene.add(l);return l;}
  objLine=predLine(0xF2C14E,0.92);
  defLine=predLine(0xBFD6E4,0.42);
  objDot=new THREE.Mesh(new THREE.TorusGeometry(0.020,0.0032,6,18),
    new THREE.MeshBasicMaterial({color:0xF2C14E,transparent:true,opacity:.85}));
  objDot.rotation.x=Math.PI/2;objDot.visible=false;scene.add(objDot);
  ghost=new THREE.Mesh(new THREE.TorusGeometry(BR,0.0026,6,24),
    new THREE.MeshBasicMaterial({color:0x7FD4E8,transparent:true,opacity:.6}));
  ghost.rotation.x=Math.PI/2;scene.add(ghost);

  ray=new THREE.Raycaster();
  plane=new THREE.Plane(new V3(0,1,0),-BR);
  resize();applyCam();
}
function resize(){cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight,false);}
addEventListener("resize",resize);

/* ══ CÂMERA ORBITAL ══ */
var orb={th:0,ph:0.98,rad:4.25,tx:0,ty:0.02,tz:-0.06};
function applyCam(){
  var sp=Math.sin(orb.ph),cp=Math.cos(orb.ph);
  cam.position.set(orb.tx+orb.rad*sp*Math.sin(orb.th),orb.ty+orb.rad*cp,orb.tz+orb.rad*sp*Math.cos(orb.th));
  cam.lookAt(orb.tx,orb.ty,orb.tz);
}
