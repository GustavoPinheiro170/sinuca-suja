/* Sinuca Suja — Atendente e bêbado: modelo, animação e raiva
   Sem bundler: carregado por <script> no index.html, na ordem definida lá. */

/* ══ GENTE ══ */
var NPCS=[],npcMeshes=[];
function limb(len,r0,r1,mt){
  var g=new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(r1,r0,len,10),mt,0,-len/2,0));
  g.add(mesh(new THREE.SphereGeometry(r1*1.05,10,8),mt,0,-len,0));
  var end=new THREE.Group();end.position.y=-len;g.add(end);
  g.userData.end=end;return g;
}
function makePerson(cfg){
  var skin=M({color:cfg.skin,roughness:.72,metalness:0,envMap:envMap});
  var shirt=M({color:cfg.shirt,roughnessMap:TX.grain,roughness:.90,metalness:0,envMap:envMap});
  var pants=M({color:cfg.pants,roughness:.93,metalness:0,envMap:envMap});
  var hair=M({color:cfg.hair,roughness:.95,metalness:0,envMap:envMap});
  var root=new THREE.Group(),body=new THREE.Group();root.add(body);

  body.add(mesh(lathe([[0,0],[0.150,0.010],[0.158,0.090],[0.150,0.230],[0.162,0.360],
    [0.168,0.440],[0.150,0.520],[0.105,0.552],[0,0.556]],18),shirt));
  if(cfg.apron){
    var ap=mesh(new THREE.BoxGeometry(0.27,0.46,0.02),
      M({color:0x7E7466,roughnessMap:TX.grain,roughness:.95,envMap:envMap}),0,0.20,0.152);
    body.add(ap);
    body.add(mesh(new THREE.BoxGeometry(0.035,0.20,0.015),
      M({color:0x7E7466,roughness:.95,envMap:envMap}),0.07,0.50,0.145));
  }
  body.add(mesh(new THREE.CylinderGeometry(0.048,0.055,0.075,10),skin,0,0.585,0));
  var head=new THREE.Group();head.position.y=0.625;body.add(head);
  var sk=mesh(new THREE.SphereGeometry(0.104,18,14),skin);sk.scale.set(0.94,1.12,1.0);head.add(sk);
  head.add(mesh(new THREE.SphereGeometry(0.020,8,6),skin,0,-0.012,0.101));
  head.add(mesh(new THREE.SphereGeometry(0.0135,8,6),M({color:0x1A1512,roughness:.35,envMap:envMap}),-0.043,0.020,0.090));
  head.add(mesh(new THREE.SphereGeometry(0.0135,8,6),M({color:0x1A1512,roughness:.35,envMap:envMap}), 0.043,0.020,0.090));
  if(cfg.cap){
    head.add(mesh(new THREE.SphereGeometry(0.108,16,8,0,TAU,0,Math.PI/2),
      M({color:cfg.cap,roughness:.9,envMap:envMap}),0,0.016,0));
    head.add(mesh(new THREE.BoxGeometry(0.175,0.014,0.105),
      M({color:cfg.cap,roughness:.9,envMap:envMap}),0,0.018,0.098));
  }else{
    var hr=mesh(new THREE.SphereGeometry(0.107,16,10,0,TAU,0,Math.PI*0.56),hair,0,0.012,-0.006);
    head.add(hr);
    if(cfg.beard){
      var bd=mesh(new THREE.SphereGeometry(0.092,14,10,0,TAU,Math.PI*0.52,Math.PI*0.48),hair,0,-0.010,0.014);
      head.add(bd);}
  }
  var arms={};
  [["L",-1],["R",1]].forEach(function(sd){
    var a=limb(0.255,0.052,0.042,shirt);
    a.position.set(sd[1]*0.168,0.502,0);body.add(a);
    var f=limb(0.245,0.042,0.034,skin);a.userData.end.add(f);
    f.userData.end.add(mesh(new THREE.SphereGeometry(0.050,10,8),skin));
    arms[sd[0]]={up:a,fore:f,hand:f.userData.end};
  });
  if(cfg.legs){
    [[-0.085,1],[0.085,-1]].forEach(function(sd){
      var t=limb(0.40,0.075,0.062,pants);
      t.position.set(sd[0],0.02,0);t.rotation.x=cfg.seated?-1.32:0.02;body.add(t);
      var sh=limb(0.40,0.060,0.048,pants);t.userData.end.add(sh);
      sh.rotation.x=cfg.seated?1.45:-0.02;
      sh.userData.end.add(mesh(new THREE.BoxGeometry(0.095,0.055,0.215),
        M({color:0x1C1A18,roughness:.75,envMap:envMap}),0,-0.02,0.055));
    });
  }
  root.position.set(cfg.p[0],cfg.p[1],cfg.p[2]);
  root.rotation.y=cfg.ry||0;
  scene.add(root);
  var npc={root:root,body:body,head:head,arms:arms,cfg:cfg,anger:0,t:Math.random()*9,
    hitY:0.34,baseRy:cfg.ry||0,back:null,drink:0};
  root.traverse(function(n){if(n.isMesh){n.userData.npcRef=npc;npcMeshes.push(n);}});
  if(cfg.bottle){
    var bt=mesh(lathe([[0,0],[0.028,0.004],[0.030,0.012],[0.029,0.115],[0.019,0.150],
      [0.0115,0.172],[0.0112,0.212],[0.0135,0.218],[0,0.216]],14),
      M({color:0x8A5A18,roughness:.10,metalness:0,transparent:true,opacity:.72,
        envMap:envMap,envMapIntensity:1.9}),0,-0.055,0.02);
    bt.rotation.x=1.5;arms.R.hand.add(bt);npc.bottle=bt;
  }
  NPCS.push(npc);return npc;
}
function angerNPC(n,o){
  if(n.anger>0)return;
  n.anger=3.0;Som.raiva();
  var L=n.cfg.lines;
  toast(L[Math.floor(Math.random()*L.length)],n.cfg.nome+" se levantou","bad");
  if(o)n.back={obj:o,t:1.15};
}
function animateNPCs(dt){
  for(var i=0;i<NPCS.length;i++){
    var n=NPCS[i];n.t+=dt;
    if(n.back){
      n.back.t-=dt;
      if(n.back.t<=0){
        var c=G&&G.balls[0].live?G.balls[0]:{x:0,z:0};
        var a=Math.random()*TAU;
        hurl(n.back.obj,Math.max(-HW+0.09,Math.min(HW-0.09,c.x+Math.cos(a)*0.17)),0.075,
                        Math.max(-HL+0.09,Math.min(HL-0.09,c.z+Math.sin(a)*0.17)));
        toast("Ele devolveu","bem na sua linha","bad");
        n.back=null;}
    }
    if(n.anger>0){
      n.anger-=dt;
      var f=Math.min(1,n.anger*2.2);
      n.body.position.y=f*0.11;
      n.root.rotation.y=n.baseRy+Math.sin(n.t*30)*0.16*f;
      n.arms.L.up.rotation.x=-2.35*f-0.1;n.arms.R.up.rotation.x=-2.35*f-0.1;
      n.arms.L.up.rotation.z= 0.55*f;n.arms.R.up.rotation.z=-0.55*f;
      n.arms.L.fore.rotation.x=-0.5*f;n.arms.R.fore.rotation.x=-0.5*f;
      n.head.rotation.x=-0.30*f;n.head.rotation.z=Math.sin(n.t*26)*0.14*f;
      if(n.anger<=0){n.anger=0;n.body.position.y=0;n.root.rotation.y=n.baseRy;
        n.head.rotation.set(0,0,0);}
      continue;
    }
    n.body.rotation.y=Math.sin(n.t*0.75)*0.10;
    n.head.rotation.y=Math.sin(n.t*0.42)*0.30;
    n.head.rotation.x=Math.sin(n.t*0.6)*0.06;
    if(n.cfg.wipe){
      n.arms.R.up.rotation.x=-1.02+Math.sin(n.t*2.6)*0.20;
      n.arms.R.up.rotation.z=-0.62+Math.cos(n.t*2.6)*0.26;
      n.arms.R.fore.rotation.x=-0.58;
      n.arms.L.up.rotation.x=-0.16;n.arms.L.up.rotation.z=0.14;
      n.arms.L.fore.rotation.x=-0.30;
    }else{
      var cyc=(n.t%7.5);
      n.drink=cyc>4.6&&cyc<6.3?Math.sin((cyc-4.6)/1.7*Math.PI):0;
      n.arms.R.up.rotation.x=-0.34-n.drink*0.52;
      n.arms.R.up.rotation.z=-0.16;
      n.arms.R.fore.rotation.x=-1.30-n.drink*1.05;
      n.arms.L.up.rotation.x=-0.55;n.arms.L.up.rotation.z=0.10;
      n.arms.L.fore.rotation.x=-1.25;
      n.head.rotation.x+=-n.drink*0.34;
    }
  }
}
