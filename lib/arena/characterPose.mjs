import { Vector3, Quaternion, Object3D } from 'three';

const smooth = (x, a=0, b=1) => {
  const t=Math.max(0,Math.min(1,(x-a)/(b-a)));
  return t*t*(3-2*t);
};
const mix=(a,b,t)=>a+(b-a)*t;

export function createContactRig(model) {
  const hips=model.getObjectByName('Hips'),spine=model.getObjectByName('Spine'),head=model.getObjectByName('Head');
  const arms=['Left','Right'].map(side=>{
    const upper=model.getObjectByName(side+'Arm'),lower=model.getObjectByName(side+'ForeArm'),palm=new Object3D();
    palm.position.set(0,-.32,.015);lower?.add(palm);return {upper,lower,palm};
  });
  const legs=['Left','Right'].map(side=>({upper:model.getObjectByName(side+'UpLeg'),lower:model.getObjectByName(side+'Leg'),foot:model.getObjectByName(side+'Foot')}));
  const names=['Hips','Spine','Head','LeftArm','LeftForeArm','RightArm','RightForeArm','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot'];
  const bones=names.map(name=>model.getObjectByName(name));
  if(bones.some(bone=>!bone))throw new Error('Performer contact rig is incomplete');
  const rests=bones.map(o=>({position:o.position.clone(),quaternion:o.quaternion.clone()}));
  model.updateWorldMatrix(true,true);
  return {hips,spine,head,arms,bones,rests,rest:hips.position.clone(),legs,feet:legs.map(leg=>leg.foot.getWorldQuaternion(new Quaternion())),forward:new Vector3(),orientation:new Quaternion()};
}

export function resetContactRig(rig){
  rig.bones.forEach((bone,i)=>{bone.position.copy(rig.rests[i].position);bone.quaternion.copy(rig.rests[i].quaternion);});
}

export function applyRingContacts(root,rig,pose){
  rig.spine.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(1,0,0),pose.lean));
  rig.spine.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0,0,1),-pose.lean*.21));
  rig.head.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(1,0,0),-pose.lean*.3));
  rig.hips.position.y=rig.rest.y+pose.pelvis;
  root.updateWorldMatrix(true,true);
  rig.forward.set(0,0,1).applyQuaternion(root.quaternion);
  const errors={feet:[],hands:[]};
  rig.legs.forEach((leg,i)=>{
    rig.orientation.copy(root.quaternion).multiply(rig.feet[i]);
    errors.feet.push(placeLeg(leg.upper,leg.lower,leg.foot,i===0?pose.left:pose.right,rig.forward,rig.orientation));
  });
  if(pose.grip>0)rig.arms.forEach((arm,i)=>{
    const target=arm.palm.getWorldPosition(new Vector3()).lerp(new Vector3(...pose.hands[i]),pose.grip);
    errors.hands.push(placeLimb(arm.upper,arm.lower,arm.palm,target,new Vector3(.8,i===0?-.4:.3,i===0?.18:-.18)));
  });
  return errors;
}

/** World-space sole supports, independent of frame rate and scroll direction. */
export function stairFootTargets(pose, root, hipHeight=.92, legLength=.87) {
  const {from,to,phase,stepIndex,progress:q}=pose;
  if(phase==='platform') return {pelvis:0,left:[root[0],root[1],root[2]+.13],right:[root[0],root[1],root[2]-.13]};
  const leadLeft=stepIndex%2===0;
  let lead,trail,pelvis;
  if(phase==='lift') {
    lead=[mix(from[0],to[0],smooth(q,.45,1)),mix(from[1],to[1],smooth(q,0,.42))+.08*Math.sin(Math.PI*q),root[2]];
    trail=[from[0],from[1],root[2]];
    pelvis=-.27*q;
  } else {
    const t=smooth(q,.05,.8);
    lead=[to[0],to[1],root[2]];
    trail=[mix(from[0],to[0],smooth(t,.45,1)),mix(from[1],to[1],smooth(t,0,.42))+.08*Math.sin(Math.PI*t),root[2]];
    pelvis=-.27*(1-smooth(q,0,.8));
  }
  const left=leadLeft?lead:trail,right=leadLeft?trail:lead;
  // Keep both planted ankles reachable while the trailing foot leaves its tread.
  // These defaults are the measured rest dimensions of the exported performer.
  for(const foot of [left,right]) {
    const horizontal=root[0]-foot[0];
    const reachable=Math.sqrt(Math.max(0,(legLength-.001)**2-horizontal**2));
    pelvis=Math.min(pelvis,foot[1]+.05+reachable-root[1]-hipHeight);
  }
  return {pelvis,left:[left[0],left[1],left[2]+.13],right:[right[0],right[1],right[2]-.13]};
}

/** Analytic two-bone IK; rotate the original skin skeleton, without export-only targets. */
export function placeLeg(upper, lower, foot, sole, forward, footOrientation) {
  const target=new Vector3(sole[0],sole[1]+.05,sole[2]);
  const error=placeLimb(upper,lower,foot,target,forward);
  foot.quaternion.copy(foot.parent.getWorldQuaternion(new Quaternion()).invert().multiply(footOrientation));
  foot.updateWorldMatrix(false,true);
  return error;
}

/** Shared analytic solver for foot contacts and palm-to-rope contacts. */
export function placeLimb(upper, lower, foot, target, forward) {
  const hip=upper.getWorldPosition(new Vector3()),knee=lower.getWorldPosition(new Vector3()),ankle=foot.getWorldPosition(new Vector3());
  const l1=hip.distanceTo(knee),l2=knee.distanceTo(ankle);
  const direction=target.clone().sub(hip),d=Math.max(.001,Math.min(direction.length(),l1+l2));
  direction.normalize();
  const bend=forward.clone().addScaledVector(direction,-forward.dot(direction)).normalize();
  const along=(l1*l1-l2*l2+d*d)/(2*d);
  const wantedKnee=hip.clone().addScaledVector(direction,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));
  const rotate=(bone,start,end,wanted)=>{
    const delta=new Quaternion().setFromUnitVectors(end.clone().sub(start).normalize(),wanted.clone().sub(start).normalize());
    const world=bone.getWorldQuaternion(new Quaternion()).premultiply(delta);
    bone.quaternion.copy(bone.parent.getWorldQuaternion(new Quaternion()).invert().multiply(world));
    bone.updateWorldMatrix(false,true);
  };
  rotate(upper,hip,knee,wantedKnee);
  const actualKnee=lower.getWorldPosition(new Vector3());
  rotate(lower,actualKnee,foot.getWorldPosition(new Vector3()),target);
  return foot.getWorldPosition(new Vector3()).distanceTo(target);
}
