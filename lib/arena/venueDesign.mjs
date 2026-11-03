import * as T from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// One metre-scale construction definition drives Blender source and web placement.
export const TIERS=Array.from({length:3},(_,i)=>({radius:18+i*4.5,y:.05+i*4.3,rows:9,rise:.36,run:.43}));
export function tierPoint(radius,angle,y=0){return [Math.cos(angle)*radius,y,Math.sin(angle)*radius*2-17];}

export function buildVenueParts(){
  const buckets=new Map();
  function put(g,name,material,p=[0,0,0],rotation=[0,0,0]){
    if(name.startsWith('SM_Scoreboard') && name!=='SM_ScoreboardSuspension') p=[p[0],p[1]-1.2,p[2]];
    if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));
    g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(...p),new T.Quaternion().setFromEuler(new T.Euler(...rotation)),new T.Vector3(1,1,1)));
    const key=name+'|'+material;
    if(!buckets.has(key))buckets.set(key,[]);
    buckets.get(key).push(g);
  }
  const box=(name,m,p,s,r=[0,0,0],bevel=.025)=>put((Math.min(...s)<.07 || name.startsWith('SM_Stage'))?new T.BoxGeometry(...s):new RoundedBoxGeometry(...s,1,Math.min(bevel,...s.map(n=>n*.18))),name,m,p,r);
  function tube(name,m,a,b,r=.035,segments=8){
    const from=new T.Vector3(...a),to=new T.Vector3(...b),d=to.clone().sub(from);
    const g=new T.CylinderGeometry(r,r,d.length(),segments);
    g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));
    put(g,name,m,from.add(to).multiplyScalar(.5).toArray());
  }
  // Closed elliptical profile: proper treads, risers, fascia and soffit, not rails floating in black.
  function sweptProfile(name,material,profile,segments=160){
    const verts=[],indices=[],uv=[];
    for(let i=0;i<segments;i++)for(let j=0;j<profile.length;j++){
      const [r,y]=profile[j];verts.push(...tierPoint(r,i/segments*Math.PI*2,y));uv.push(i/segments*32,j/profile.length*4);
    }
    for(let i=0;i<segments;i++)for(let j=0;j<profile.length;j++){
      const a=i*profile.length+j,b=((i+1)%segments)*profile.length+j,c=((i+1)%segments)*profile.length+(j+1)%profile.length,d=i*profile.length+(j+1)%profile.length;
      indices.push(a,b,c,a,c,d);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
    put(g,name,material);
  }
  for(const [level,tier] of TIERS.entries()){
    const profile=[[tier.radius,tier.y-.55],[tier.radius,tier.y]];
    for(let row=0;row<tier.rows;row++){
      profile.push([tier.radius+(row+1)*tier.run,tier.y+row*tier.rise]);
      if(row<tier.rows-1)profile.push([tier.radius+(row+1)*tier.run,tier.y+(row+1)*tier.rise]);
    }
    profile.push([tier.radius+tier.rows*tier.run,tier.y-.55]);
    sweptProfile('SM_Terraces','M_Concrete',profile);
    sweptProfile('SM_BalconyFascia','M_PaintedSteel',[[tier.radius-.15,tier.y-.55],[tier.radius-.15,tier.y+.24],[tier.radius-.04,tier.y+.24],[tier.radius-.04,tier.y-.55]]);
    // A single substantial ribbon per balcony replaces the repeated red line lattice.
    sweptProfile('SM_RibbonLED','M_RibbonLED',[[tier.radius-.175,tier.y-.36],[tier.radius-.175,tier.y-.21],[tier.radius-.156,tier.y-.21],[tier.radius-.156,tier.y-.36]]);
    for(let i=0;i<80;i++){
      const a=i/80*Math.PI*2,b=(i+1)/80*Math.PI*2;
      tube('SM_BalconyRails','M_Steel',tierPoint(tier.radius-.06,a,tier.y+.86),tierPoint(tier.radius-.06,b,tier.y+.86),.025,6);
      if(i%2===0)tube('SM_BalconyRails','M_Steel',tierPoint(tier.radius-.06,a,tier.y+.05),tierPoint(tier.radius-.06,a,tier.y+.86),.025,6);
      if(level>0 && i%4===0){
        const height=tier.y-.55;
        const p=tierPoint(tier.radius+1.5,a,height*.5);
        box('SM_BalconyColumns','M_Concrete',p,[.48,height,.48]);
      }
    }
  }
  function truss(a,b,width=.55){
    const from=new T.Vector3(...a),to=new T.Vector3(...b),axis=to.clone().sub(from).normalize();
    const u=new T.Vector3().crossVectors(axis,Math.abs(axis.y)>.9?new T.Vector3(1,0,0):new T.Vector3(0,1,0)).normalize().multiplyScalar(width*.5);
    const v=new T.Vector3().crossVectors(axis,u).normalize().multiplyScalar(width*.5);
    const corners=[u.clone().add(v),u.clone().sub(v),u.clone().negate().sub(v),v.clone().sub(u)];
    corners.forEach(c=>tube('SM_RoofStructure','M_Steel',from.clone().add(c).toArray(),to.clone().add(c).toArray(),.04,6));
    const bays=Math.ceil(from.distanceTo(to)/1.6);
    for(let i=0;i<bays;i++)for(let side=0;side<4;side++){
      const start=from.clone().lerp(to,i/bays).add(corners[side]);
      const end=from.clone().lerp(to,(i+1)/bays).add(corners[(side+1)%4]);
      tube('SM_RoofStructure','M_Steel',start.toArray(),end.toArray(),.017,5);
    }
  }
  // Radial girders and ceiling service bridges frame every checkpoint in one venue.
  for(let i=0;i<16;i++){
    const a=i/16*Math.PI*2;
    truss(tierPoint(11,a,15.2),tierPoint(31,a,14.4),.8);
    box('SM_RoofColumns','M_PaintedSteel',tierPoint(31,a,7.2),[.45,14.4,.45]);
  }
  for(const z of [-39,-29,-16,-3,10])truss([-25,14.8,z],[25,14.8,z],.6);
  for(const x of [-18,18])truss([x,14.7,-43],[x,14.7,16],.65);
  for(const side of [-1,1]){
    truss([-3,15.2,side*3],[3,15.2,side*3]);
    truss([side*3,15.2,-3],[side*3,15.2,3]);
  }
  // Four-faced suspended scoreboard: lowered so faces, not only its underside, are visible.
  box('SM_ScoreboardBody','M_PaintedSteel',[0,8,0],[5.8,2.8,5.8],[0,0,0],.2);
  for(const side of [-1,1]){
    box('SM_ScoreboardScreens','M_ScoreboardLED',[0,8,side*2.94],[5.1,2.15,.08]);
    box('SM_ScoreboardScreens','M_ScoreboardLED',[side*2.94,8,0],[.08,2.15,5.1]);
    for(const y of [6.62,9.38]){
      box('SM_ScoreboardFrame','M_Steel',[0,y,side*2.91],[5.8,.13,.16]);
      box('SM_ScoreboardFrame','M_Steel',[side*2.91,y,0],[.16,.13,5.8]);
    }
    for(const x of [-2.76,2.76])box('SM_ScoreboardFrame','M_Steel',[x,8,side*2.94],[.13,2.65,.13]);
    for(const z of [-2.76,2.76])box('SM_ScoreboardFrame','M_Steel',[side*2.94,8,z],[.13,2.65,.13]);
    for(const x of [-1.8,1.8])tube('SM_ScoreboardSuspension','M_Steel',[x,8.2,side*1.8],[x,15.2,side*3],.04,8);
  }
  for(let i=0;i<15;i++)box('SM_ScoreboardVent','M_Rubber',[-2.1+i*.3,6.58,0],[.12,.04,4.4]);
  // A shared chair mesh for instanced near-tier seat detail.
  box('SM_Seat','M_Seat',[0,.45,0],[.42,.09,.4]);
  box('SM_Seat','M_Seat',[0,.7,-.18],[.42,.48,.08],[-.08,0,0],.04);
  for(const x of [-.17,.17])for(const z of [-.14,.14])tube('SM_Seat','M_Seat',[x,0,z],[x,.43,z],.018,6);
  // Service cabinets at the entrance establish thickness and panel construction.
  for(const side of [-1,1])for(let level=0;level<4;level++){
    const x=side*10.95,y=2.1+level*2.55;
    box('SM_StageServicePanels','M_PaintedSteel',[x,y,-40],[1.45,2.28,.5]);
    for(const dx of [-.6,.6])for(const dy of [-1,1])box('SM_StagePanelFasteners','M_Steel',[x+dx,y+dy,-39.73],[.14,.14,.14]);
    for(let vent=0;vent<10;vent++)box('SM_StageVents','M_Rubber',[x,y-.7+vent*.1,-39.73],[.9,.035,.08]);
  }
  for(const side of [-1,1]){
    box('SM_StageServicePanels','M_PaintedSteel',[side*10.95,5.62,-40.45],[.3,11,.25]);
    box('SM_StageServicePanels','M_PaintedSteel',[side*10.95,.06,-40.35],[1.5,.12,.9]);
  }
  box('SM_ArenaFloor','M_Floor',[0,-.09,-17],[95,.18,165]);
  return [...buckets].map(([key,parts])=>{
    const [name,material]=key.split('|');const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());g.computeBoundingBox();
    return {name,material,geometry:g};
  });
}




