/* ══ LOOP ══ */
function proj3(x,y,z){
  var v=new V3(x,y,z).project(cam);
  return {x:(v.x*0.5+0.5)*innerWidth,y:(-v.y*0.5+0.5)*innerHeight};
}
function aimDir(){
  ray.setFromCamera(new THREE.Vector2(mouse.x,mouse.y),cam);
  var pt=new V3();
  if(!ray.ray.intersectPlane(plane,pt))return null;
  var c=G.balls[0],dx=pt.x-c.x,dz=pt.z-c.z,d=Math.hypot(dx,dz);
  if(d<1e-4)return null;
  return {x:dx/d,z:dz/d};
}
function rollUp(an,ax){
  var q=new THREE.Quaternion().setFromUnitVectors(an.axis,ax);
  if(!an.downDir)return q;
  var ws=an.downDir.clone().applyQuaternion(q);
  ws.addScaledVector(ax,-ws.dot(ax));
  if(ws.lengthSq()<1e-8)return q;
  ws.normalize();
  var up=new V3(0,-1,0).addScaledVector(ax,ax.y);
  if(up.lengthSq()<1e-8)up.set(0,0,1);
  up.normalize();
  var cs=Math.max(-1,Math.min(1,ws.dot(up)));
  var sg=new V3().crossVectors(ws,up).dot(ax)>=0?1:-1;
  return q.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,sg*Math.acos(cs)));
}
function poseCue(o,dir,pull,vis){
  var w=homeGroups[o.id];w.visible=vis;
  markers[o.id].visible=false;
  if(!vis)return;
  var c=G.balls[0],e=o.an.elev,ce=Math.cos(e),se=Math.sin(e);
  var d=new V3(dir.x,0,dir.z).normalize();
  var ax=new V3(d.x*ce,-se,d.z*ce).normalize();
  w.position.set(c.x-d.x*pull*ce,BR+pull*se,c.z-d.z*pull*ce);
  w.quaternion.copy(rollUp(o.an,ax));
  w.userData.inner.position.copy(o.an.tipPoint).multiplyScalar(-1);
  w.userData.inner.quaternion.identity();
}
function updateHover(){
  hovered=null;
  if(!G||G.over)return;
  var canCue=(G.phase==="aim");
  var canThrow=(G.turn==="foe"&&G.throwsLeft>0&&!G.held&&
    (G.phase==="foe-pick"||G.phase==="foe-aim"||G.phase==="foe-hit"||
     G.phase==="aguardando"||G.phase==="roll"));
  var canRemove=(G.turn==="you"&&G.phase==="aim"&&!G.held);
  if(!canCue&&!canThrow&&!canRemove)return;
  ray.setFromCamera(new THREE.Vector2(mouse.x,mouse.y),cam);
  var hits=ray.intersectObjects(pickables,true);
  for(var i=0;i<hits.length;i++){
    var ow=hits[i].object.userData.owner;if(!ow)continue;
    if(ow.kind==="cue"&&canCue){
      if(ow.id===G.obj.id||ow.id===G.foeObj.id)continue;
      hovered={kind:"cue",id:ow.id};return;}
    if(ow.kind==="junk"&&canRemove&&ow.obj.onTable&&ow.obj.state==="rest"){
      hovered={kind:"rm",obj:ow.obj};return;}
    if(ow.kind==="junk"&&canThrow&&ow.obj.state==="idle"&&!ow.obj.onTable){
      hovered={kind:"junk",obj:ow.obj};return;}}
}
/* Uma porta só para cada ação de rede: simula primeiro, avisa depois com o
   resultado exato. Assim o teste automatizado percorre o mesmo caminho do
   jogador de verdade, sem uma segunda cópia da lógica para sair de sincronia. */
function tacar(dir,pw){
  shoot(dir,pw,"you");
  if(G.modo==="online")Rede.enviar({t:"tacada",dx:dir.x,dz:dir.z,p:pw,obj:G.obj.id,
    vx:G.balls[0].vx,vz:G.balls[0].vz});
}
function arremessar(jo,at){
  var jIdx=junkPool.indexOf(jo);
  if(!hurl(jo,at.x,at.y,at.z))return false;
  if(G.modo==="online")Rede.enviar({t:"arremesso",j:jIdx,x:at.x,z:at.z,sem:jo.sem});
  return true;
}
function frame(ts){
  requestAnimationFrame(frame);
  if(!prev)prev=ts;
  var dt=Math.min(0.05,(ts-prev)/1000);prev=ts;
  if(!G){renderer.render(scene,cam);return;}
  if(toastT>0){toastT-=dt;if(toastT<=0)ui({toast:null});}
  if(neonL)neonL.intensity=1.15+Math.sin(ts*0.011)*0.28+(Math.random()<0.02?-0.85:0);

  /* Passo fixo: com dt variável cada máquina daria um número diferente de
     integrações e as simulações divergiriam. Aqui as duas dão exatamente o
     mesmo número de passos para o mesmo tempo simulado. */
  acumul+=dt; if(acumul>0.25)acumul=0.25;
  var nPassos=0;
  while(acumul>=DT_FIXO&&nPassos<40){
    if(G.phase==="roll")stepBalls(DT_FIXO);
    stepJunk(DT_FIXO);
    /* Dentro do laço de propósito: testado uma vez por quadro, uma máquina a
       50fps encerrava a jogada num instante simulado diferente de outra a
       144fps — e endTurn zera velocidades e pode repor a branca. */
    if(G.phase==="roll"&&!moving())endTurn();
    acumul-=DT_FIXO; nPassos++;
  }
  if(G.phase!=="roll"){
    if(G.phase==="foe-pick"){
      G.anim-=dt;
      if(G.anim<=0){
        var pool=OBJECTS.filter(function(o){return o.id!==G.obj.id;});
        equipFoe(pool[Math.floor(Math.random()*pool.length)]);
        var pk=foeAimCompute();
        G.foeAimDir={x:pk.dx,z:pk.dz};G.foePw=pk.pw;
        G.phase="foe-aim";G.foeT=0;G.anim=3.1;G.foeThrew=false;
        toast("Trapaceiro mira","clique numa tralha do bar","cold");sync();}
    }else if(G.phase==="foe-aim"){
      G.anim-=dt;G.foeT+=dt;
      if(G.anim<=1.1&&!G.foeThrew){
        G.foeThrew=true;
        var idle=junkPool.filter(function(o){return o.state==="idle"&&!o.onTable;});
        if(idle.length&&Math.random()<0.85){
          var pj=idle[Math.floor(Math.random()*idle.length)],tg=tableTarget();
          hurl(pj,tg.x,0.075,tg.z);
          toast("Ele jogou "+pj.t.nome.toLowerCase(),"na sua linha","cold");}}
      if(G.anim<=0){G.phase="foe-hit";G.anim=0.55;}
    }else if(G.phase==="foe-hit"){
      G.anim-=dt;if(G.anim<=0)shoot(G.foeAimDir,G.foePw,"foe");
    }
  }

  animateNPCs(dt);

  var aimT=null;
  if(G.held){
    aimT=throwAim();
    if(aimT){
      var sol=solveThrow(G.held.x,G.held.y,G.held.z,aimT.x,aimT.y,aimT.z);
      var pa2=arcLine.geometry.attributes.position;
      for(var k=0;k<32;k++){
        var t2=sol.T*k/31;
        pa2.setXYZ(k,G.held.x+sol.vx*t2,G.held.y+sol.vy*t2-0.5*GACC*t2*t2,G.held.z+sol.vz*t2);}
      pa2.needsUpdate=true;arcLine.geometry.computeBoundingSphere();
      arcLine.visible=true;
      arcLine.material.color.setHex(aimT.npc?0xFF6B3D:0x7FD4E8);
      arcRing.visible=!aimT.npc;
      if(!aimT.npc)arcRing.position.set(aimT.x,0.036,aimT.z);
      arcRing.material.opacity=0.55+Math.sin(ts*0.008)*0.25;
    }
  }else{arcLine.visible=false;arcRing.visible=false;}
  G.aimT=aimT;
  for(var q5=0;q5<NPCS.length;q5++){
    var on2=!!(aimT&&aimT.npc===NPCS[q5]);
    NPCS[q5].root.traverse(function(m){
      if(m.isMesh&&m.material&&m.material.emissive)m.material.emissive.setHex(on2?0x5A1C10:0x000000);});
  }

  for(var i=0;i<G.balls.length;i++){
    var b=G.balls[i];ballMesh[i].visible=b.live;
    if(b.live){
      ballMesh[i].position.set(b.x,BR,b.z);
      var sp2=Math.hypot(b.vx,b.vz);
      if(sp2>0.001)ballMesh[i].rotateOnWorldAxis(new V3(-b.vz,0,b.vx).normalize(),sp2*dt/BR);}}

  var pulse=0.16+Math.sin(ts*0.004)*0.10;
  OBJECTS.forEach(function(o){
    var w=homeGroups[o.id],free=(o.id!==G.obj.id&&o.id!==G.foeObj.id);
    if(free){
      if(!w.userData.atHome)placeHome(o);
      w.visible=true;
      var on=hovered&&hovered.kind==="cue"&&hovered.id===o.id;
      glow(w,on);
      var mk=markers[o.id];
      mk.visible=(G.phase==="aim");
      mk.material.opacity=on?0.55:pulse;
    }else glow(w,false);});
  junkPool.forEach(function(o){
    glow(o.g,hovered&&hovered.kind==="junk"&&hovered.obj===o);});

  var youAim=(G.phase==="aim"&&!G.over);
  aimLine.visible=youAim;ghost.visible=youAim;
  if(!youAim){objLine.visible=false;defLine.visible=false;objDot.visible=false;}
  foeAim.visible=(G.phase==="foe-aim"||G.phase==="foe-hit");

  if(youAim){
    var d=(G.charging&&G.aimLock)?G.aimLock:aimDir();
    if(d){
      var c=G.balls[0],reach=0.55+G.obj.an.controle*3.0;
      var f=firstHit(c.x,c.z,d.x,d.z,reach),pa=aimLine.geometry.attributes.position;
      pa.setXYZ(0,c.x,BR,c.z);pa.setXYZ(1,f.x,BR,f.z);pa.needsUpdate=true;
      aimLine.geometry.computeBoundingSphere();
      ghost.position.set(f.x,BR,f.z);
      ghost.material.opacity=f.tag==="ball"?0.9:(f.tag==="junk"?0.55:0.26);
      ghost.material.color.setHex(f.tag==="junk"?0xFF6B3D:0x7FD4E8);
      /* previsão: para onde vai a bola atingida, e para onde a branca desvia */
      if(f.tag==="ball"&&f.ref){
        var tb=f.ref,ox2=tb.x-f.x,oz2=tb.z-f.z,ol=Math.hypot(ox2,oz2)||1;
        var odx=ox2/ol,odz=oz2/ol;
        var t1=railClamp(tb.x,tb.z,odx,odz,0.95);
        var oa=objLine.geometry.attributes.position;
        oa.setXYZ(0,tb.x,BR,tb.z);oa.setXYZ(1,tb.x+odx*t1,BR,tb.z+odz*t1);oa.needsUpdate=true;
        objLine.geometry.computeBoundingSphere();objLine.visible=true;
        objDot.position.set(tb.x+odx*t1,BR,tb.z+odz*t1);objDot.visible=true;
        var pr=d.x*odx+d.z*odz,tx2=d.x-odx*pr,tz2=d.z-odz*pr,tl=Math.hypot(tx2,tz2);
        if(tl>0.02){
          tx2/=tl;tz2/=tl;
          var t2=Math.min(0.42,railClamp(f.x,f.z,tx2,tz2,0.42));
          var da=defLine.geometry.attributes.position;
          da.setXYZ(0,f.x,BR,f.z);da.setXYZ(1,f.x+tx2*t2,BR,f.z+tz2*t2);da.needsUpdate=true;
          defLine.geometry.computeBoundingSphere();defLine.visible=true;
        }else defLine.visible=false;
      }else{objLine.visible=false;defLine.visible=false;objDot.visible=false;}
      poseCue(G.obj,d,0.055+G.power*0.40,true);}
    if(G.foeObj.id!==G.obj.id){
      if(!homeGroups[G.foeObj.id].userData.atHome)placeHome(G.foeObj);
      homeGroups[G.foeObj.id].visible=true;
    }
  }else if(G.phase==="foe-aim"||G.phase==="foe-hit"){
    var fd=G.foeAimDir,c2=G.balls[0];
    var wob=G.phase==="foe-aim"?Math.sin(G.foeT*3.0)*0.030:0;
    var ca=Math.cos(wob),sa2=Math.sin(wob);
    var d3={x:fd.x*ca-fd.z*sa2,z:fd.x*sa2+fd.z*ca};
    var pull=G.phase==="foe-aim"?(0.09+Math.abs(Math.sin(G.foeT*1.6))*0.24)
                                :(0.33*Math.max(0,G.anim/0.55));
    poseCue(G.foeObj,d3,0.05+pull,true);
    if(!homeGroups[G.obj.id].userData.atHome)placeHome(G.obj);
    homeGroups[G.obj.id].visible=true;
    var f2=firstHit(c2.x,c2.z,d3.x,d3.z,2.4),fp=foeAim.geometry.attributes.position;
    fp.setXYZ(0,c2.x,BR,c2.z);fp.setXYZ(1,f2.x,BR,f2.z);fp.needsUpdate=true;
    foeAim.geometry.computeBoundingSphere();
  }else{
    if(!homeGroups[G.obj.id].userData.atHome)placeHome(G.obj);
    if(!homeGroups[G.foeObj.id].userData.atHome)placeHome(G.foeObj);}

  renderer.render(scene,cam);
}

/* ══ ENTRADA ══ */
var ptrs={},orbit={on:false,px:0,py:0},pinch=0;
function setCursor(){
  var cl=renderer.domElement.classList;
  cl.remove("pick");cl.remove("orbit");
  if(orbit.on)cl.add("orbit");else if(hovered)cl.add("pick");
}
addEventListener("contextmenu",function(e){e.preventDefault();});
addEventListener("pointerdown",function(e){
  Som.iniciar();
  if(e.target&&e.target.closest&&e.target.closest(".ui"))return;
  ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
  var n=Object.keys(ptrs).length;
  if(e.button===2||e.button===1||n>=2){
    orbit.on=true;orbit.px=e.clientX;orbit.py=e.clientY;
    if(n>=2){var k=Object.keys(ptrs);
      pinch=Math.hypot(ptrs[k[0]].x-ptrs[k[1]].x,ptrs[k[0]].y-ptrs[k[1]].y);}
    if(G)G.charging=false;
    setCursor();return;}
  if(!G||G.over)return;
  if(G.held){
    var at=throwAim(),jo=G.held;
    if(at&&arremessar(jo,at)){
      G.throwsLeft--;
      toast(at.npc?"Mirou em gente":"Arremessou",
        at.npc?"isso não vai acabar bem":G.throwsLeft+" restantes",at.npc?"bad":"cold");
      G.held=null;sync();}
    return;}
  updateHover();
  if(hovered){
    if(hovered.kind==="cue"){
      var o=OBJECTS.filter(function(x){return x.id===hovered.id;})[0];
      equip(o);Som.pegar();
      if(G.modo==="online")Rede.enviar({t:"taco",obj:o.id});
      toast("Pegou",o.nome.toLowerCase(),"good");sync();
    }else if(hovered.kind==="rm"){
      var ro=hovered.obj;
      ro.state="idle";ro.onTable=false;ro.vx=0;ro.vz=0;ro.av.set(0,0,0);
      ro.x=ro.home.x;ro.z=ro.home.z;
      ro.q.setFromEuler(new THREE.Euler(0,rnd()*TAU,0));
      ro.y=FLOOR+restY(ro);
      ro.g.position.set(ro.x,ro.y,ro.z);ro.g.quaternion.copy(ro.q);
      if(G.modo==="online")Rede.enviar({t:"retirar",j:junkPool.indexOf(ro)});
      toast("Tirou "+ro.t.nome.toLowerCase()+" da mesa","custou a sua vez","bad");
      G.turn="foe";G.phase="foe-pick";G.anim=0.9;sync();
    }else if(hovered.kind==="junk"&&G.throwsLeft>0&&!G.held){
      var ob=hovered.obj;ob.state="held";ob.holdY=ob.y+0.55;G.held=ob;Som.pegar();
      toast("Pegou "+ob.t.nome.toLowerCase(),"mire e clique para arremessar","cold");sync();}
    hovered=null;ui({hov:null});setCursor();return;}
  if(G.phase!=="aim")return;
  var d0=aimDir();if(!d0)return;
  G.charging=true;G.power=0;G.aimLock=d0;G.dragX=e.clientX;G.dragY=e.clientY;
});
addEventListener("pointermove",function(e){
  if(ptrs[e.pointerId])ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
  sx=e.clientX;sy=e.clientY;
  var overUI=!!(e.target&&e.target.closest&&e.target.closest(".ui"));
  if(orbit.on){
    var k2=Object.keys(ptrs);
    if(k2.length>=2){
      var d=Math.hypot(ptrs[k2[0]].x-ptrs[k2[1]].x,ptrs[k2[0]].y-ptrs[k2[1]].y);
      if(pinch>0)orb.rad=Math.max(1.7,Math.min(8.5,orb.rad*(pinch/Math.max(d,1))));
      pinch=d;}
    orb.th-=(e.clientX-orbit.px)*0.0052;
    orb.ph=Math.max(0.22,Math.min(1.44,orb.ph-(e.clientY-orbit.py)*0.0050));
    orbit.px=e.clientX;orbit.py=e.clientY;applyCam();return;}
  mouse.x=(e.clientX/innerWidth)*2-1;
  mouse.y=-(e.clientY/innerHeight)*2+1;
  if(G&&G.charging&&G.aimLock){
    var cb=G.balls[0],p0=proj3(cb.x,BR,cb.z),p1=proj3(cb.x+G.aimLock.x*0.4,BR,cb.z+G.aimLock.z*0.4);
    var axs=p1.x-p0.x,ays=p1.y-p0.y,al=Math.hypot(axs,ays)||1;
    var back=-(((e.clientX-G.dragX)*axs+(e.clientY-G.dragY)*ays)/al);
    G.power=Math.max(0,Math.min(1,back/235));
    setCursor();return;}
  if(overUI){hovered=null;setCursor();ui({hov:null});return;}
  updateHover();setCursor();
  ui({hov:hovered?(hovered.kind==="cue"?{k:"cue",id:hovered.id}
        :{k:hovered.kind,n:hovered.obj.t.nome}):null,
      hx:e.clientX,hy:e.clientY});
});
function endPtr(e){
  delete ptrs[e.pointerId];
  if(Object.keys(ptrs).length<1){orbit.on=false;pinch=0;}
  if(orbit.on){setCursor();return;}
  setCursor();
  if(!G||!G.charging)return;
  G.charging=false;
  var d=G.aimLock||aimDir();
  if(d&&G.phase==="aim"){
    if(G.power<0.045)toast("Tacada cancelada","puxe o taco para trás para dar força","cold");
    else{
      tacar(d,G.power);}}
  G.power=0;G.aimLock=null;
}
addEventListener("pointerup",endPtr);
addEventListener("pointercancel",endPtr);
addEventListener("keydown",function(e){
  if(e.key==="Escape"&&G&&G.held){
    G.held.state="idle";G.held.y=FLOOR+restY(G.held);G.held=null;
    toast("Largou","","cold");sync();}
});
addEventListener("wheel",function(e){
  e.preventDefault();
  orb.rad=Math.max(1.7,Math.min(8.5,orb.rad*(1+e.deltaY*0.0011)));applyCam();
},{passive:false});
