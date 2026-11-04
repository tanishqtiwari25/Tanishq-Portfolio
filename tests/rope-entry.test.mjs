import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Object3D,Vector3} from 'three';
import {createContactRig,resetContactRig,applyRingContacts} from '../lib/arena/characterPose.mjs';
import {RING_ENTRY,ringEntryPose,entryRopePoint,ropeLoad} from '../lib/arena/ringEntry.mjs';

function performer(){
  const b=readFileSync(new URL('../art/tt-arena/entry-fix/tt-performer-entry-candidate.glb',import.meta.url));
  const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
  const objects=j.nodes.map(n=>{
    const o=new Object3D();o.name=n.name??'';
    if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;
  });
  j.nodes.forEach((n,i)=>(n.children??[]).forEach(child=>objects[i].add(objects[child])));
  const model=new Object3D(),root=new Object3D();j.scenes[j.scene??0].nodes.forEach(i=>model.add(objects[i]));root.add(model);
  return {root,rig:createContactRig(model)};
}

test('rope anchors stay fixed, load follows contact and deformation stays modest',()=>{
  for(let i=0;i<=1000;i++){
    const p=.53+.11*i/1000;
    for(let rope=0;rope<3;rope++){
      for(const z of [-3.25,3.25])assert.deepEqual(entryRopePoint(p,rope,z),[-3.25,[1.8,2.4,3][rope],z]);
      for(let n=0;n<=40;n++){
        const z=-3.25+6.5*n/40,point=entryRopePoint(p,rope,z);
        assert.ok(Math.abs(point[1]-[1.8,2.4,3][rope])<=.501);
        assert.ok(point[1]>=1.79 && point[1]<=3.061,'rope becomes a raised gate');
      }
    }
    const pose=ringEntryPose(p);
    if(pose.q<.28 && ropeLoad(p)>.001)assert.ok(pose.grip>.99,'rope opens before the hands arrive');
  }
});

test('real exported limbs reach palm grips and foot contacts throughout entry',()=>{
  const {root,rig}=performer();let feet=0,hands=0;
  for(let i=0;i<=2400;i++){
    const p=RING_ENTRY.start+(RING_ENTRY.end-RING_ENTRY.start)*i/2400,pose=ringEntryPose(p);
    resetContactRig(rig);root.position.fromArray(pose.root);root.rotation.y=Math.PI/2;
    const errors=applyRingContacts(root,rig,pose);
    feet=Math.max(feet,...errors.feet);hands=Math.max(hands,...errors.hands);
    assert.ok(errors.feet.every(n=>n<.003),`foot misses contact at ${pose.q}: ${errors.feet}`);
    assert.ok(errors.hands.every(n=>n<.008),`palm misses rope at ${pose.q}: ${errors.hands}`);
    // Test complete shoe footprints, not only ankle/root points, against all strands.
    for(const sole of [pose.left,pose.right])for(let dx=-.09;dx<=.21001;dx+=.015){
      if(Math.abs(sole[0]+dx-RING_ENTRY.plane)<.05){
        for(let rope=0;rope<3;rope++){
          const strand=entryRopePoint(p,rope,sole[2]);
          assert.ok(sole[1]>strand[1]+.04 || sole[1]+.15<strand[1]-.04,`shoe crosses strand ${rope} at ${pose.q}`);
        }
      }
    }
  }
});

test('entry poses retrace exactly without accumulated physics or clock time',()=>{
  const p=Array.from({length:501},(_,i)=>RING_ENTRY.start+(RING_ENTRY.end-RING_ENTRY.start)*i/500);
  assert.deepEqual(p.map(ringEntryPose),p.slice().reverse().map(ringEntryPose).reverse());
  const beginning=ringEntryPose(RING_ENTRY.start),end=ringEntryPose(RING_ENTRY.end);
  assert.deepEqual(beginning.root,[-3.6,1.27,RING_ENTRY.z]);
  assert.ok(Math.abs(end.root[0]+2.5)<1e-9);assert.equal(end.grip,0);assert.equal(end.lean,0);
});
