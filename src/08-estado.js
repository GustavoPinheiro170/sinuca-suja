/* Sinuca Suja — Início de partida, equipar taco, posições
   Sem bundler: carregado por <script> no index.html, na ordem definida lá. */

/* ══ ESTADO ══ */
function placeHome(o){
  var w=homeGroups[o.id],hm=o.home;
  w.position.set(hm.p[0],hm.p[1],hm.p[2]);
  w.rotation.set(hm.r[0],hm.r[1],hm.r[2]);
  w.userData.inner.position.set(0,0,0);
  w.userData.inner.quaternion.identity();
  w.userData.atHome=true;w.visible=true;
  var mk=markers[o.id];mk.position.set(hm.p[0],hm.p[1]+0.006,hm.p[2]);mk.visible=true;
}
function equip(o){
  if(G.obj&&G.obj.id!==o.id)placeHome(G.obj);
  G.obj=o;homeGroups[o.id].userData.atHome=false;markers[o.id].visible=false;
}
function equipFoe(o){
  if(G.foeObj&&G.foeObj.id!==o.id&&G.foeObj.id!==G.obj.id)placeHome(G.foeObj);
  G.foeObj=o;homeGroups[o.id].userData.atHome=false;markers[o.id].visible=false;
}
function spawnJunk(t){
  var g=t.build();isolate(g);
  var o={t:t,g:g,x:0,y:0,z:0,vx:0,vy:0,vz:0,av:new V3(),q:new THREE.Quaternion(),
    state:"idle",r:t.r,half:t.half,mass:t.mass,onTable:false,hit:0,home:{x:0,z:0}};
  g.traverse(function(n){if(n.isMesh)n.userData.owner={kind:"junk",obj:o};});
  g.userData.isJunk=true;scene.add(g);junkPool.push(o);pickables.push(g);return o;
}
function restY(o){
  var ax=[new V3(1,0,0),new V3(0,1,0),new V3(0,0,1)],bi=0,bv=-1;
  for(var i=0;i<3;i++){
    var v=ax[i].clone().applyQuaternion(o.q),a=Math.abs(v.y);
    if(a>bv){bv=a;bi=i;}}
  return o.half[bi];
}
var SPOTS=[[-1.72,-0.32],[-2.08,-1.30],[-1.32,-2.02],[-0.52,-1.92],
           [ 1.42,-1.92],[ 2.02,-1.22],[ 1.78,-0.34],[ 2.24, 0.36],
           [-2.26, 0.42],[-1.52, 0.72],[ 1.52, 0.62],[ 0.12,-2.58]];
function newGame(){
  var b=[{x:0,z:HL*0.56,vx:0,vz:0,r:BR,cue:true,live:true,num:0}];
  var rows=[1,2,3,4,5],z0=-HL*0.42,d=BR*2.04,slots=[];
  for(var ri=0;ri<rows.length;ri++)
    for(var ci=0;ci<rows[ri];ci++)
      slots.push({x:(ci-(rows[ri]-1)/2)*d,z:z0-ri*d*0.866});
  slots.splice(12,1);
  var nums=[];for(var n=1;n<=14;n++)nums.push(n);
  for(var s=nums.length-1;s>0;s--){var j=Math.floor(Math.random()*(s+1)),tp=nums[s];nums[s]=nums[j];nums[j]=tp;}
  slots.forEach(function(sl,i){
    b.push({x:sl.x,z:sl.z,vx:0,vz:0,r:BR,cue:false,live:true,num:nums[i]});});

  junkPool.forEach(function(o){scene.remove(o.g);});
  pickables=pickables.filter(function(p){return !p.userData.isJunk;});
  junkPool=[];
  for(var i=0;i<10;i++){
    var o2=spawnJunk(JUNK[i%JUNK.length]),sp=SPOTS[i%SPOTS.length];
    o2.x=sp[0]+(Math.random()-0.5)*0.32;o2.z=sp[1]+(Math.random()-0.5)*0.32;
    o2.home={x:o2.x,z:o2.z};
    o2.q.setFromEuler(new THREE.Euler(0,Math.random()*TAU,0));
    o2.y=FLOOR+restY(o2);o2.state="idle";
  }
  OBJECTS.forEach(placeHome);
  return {balls:b,turn:"you",phase:"aim",group:null,foeGroup:null,shots:0,power:0,charging:false,
    obj:OBJECTS[0],foeObj:OBJECTS[2],anim:0,over:false,potted:[],foul:false,
    throwsLeft:3,foeAimDir:{x:0,z:-1},foeT:0,foePw:0.6,winner:null,foeThrew:false,held:null,aimT:null,aimLock:null,dragX:0,dragY:0};
}
