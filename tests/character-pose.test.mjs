import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Object3D,Vector3} from 'three';
import {sampleJourney,ENTRY} from '../lib/arena/journey.mjs';
import {stairFootTargets,placeLeg} from '../lib/arena/characterPose.mjs';

test('exported character skeleton reaches staircase foot contacts without bone stretching',()=>{
  const bytes=readFileSync(new URL('../art/tt-arena/entry-fix/tt-performer-entry-candidate.glb',import.meta.url));
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  const objects=json.nodes.map(n=>{
    const o=new Object3D();o.name=n.name??'';
    if(n.translation)o.position.fromArray(n.translation);
    if(n.rotation)o.quaternion.fromArray(n.rotation);
    if(n.scale)o.scale.fromArray(n.scale);
    return o;
  });
  json.nodes.forEach((n,i)=>(n.children??[]).forEach(child=>objects[i].add(objects[child])));
  const root=new Object3D();
  json.scenes[json.scene??0].nodes.forEach(i=>root.add(objects[i]));
  const saved=objects.map(o=>({p:o.position.clone(),q:o.quaternion.clone()}));
  const hips=root.getObjectByName('Hips');assert.ok(hips);
  for(let i=0;i<=2400;i++){
    objects.forEach((o,n)=>{o.position.copy(saved[n].p);o.quaternion.copy(saved[n].q);});
    const s=sampleJourney(ENTRY.start+(ENTRY.stairsEnd-ENTRY.start-1e-9)*i/2400);
    const targets=stairFootTargets(s.entryPose,s.avatar);
    root.position.fromArray(s.avatar);root.rotation.y=Math.PI/2;
    hips.position.y+=targets.pelvis;root.updateWorldMatrix(true,true);
    for(const [side,target] of [['Left',targets.left],['Right',targets.right]]){
      const upper=root.getObjectByName(side+'UpLeg'),lower=root.getObjectByName(side+'Leg'),foot=root.getObjectByName(side+'Foot');
      const before=[upper.getWorldPosition(new Vector3()).distanceTo(lower.getWorldPosition(new Vector3())),lower.getWorldPosition(new Vector3()).distanceTo(foot.getWorldPosition(new Vector3()))];
      const error=placeLeg(upper,lower,foot,target,new Vector3(1,0,0),root.quaternion);
      assert.ok(error<.002,`${side} ankle misses support by ${error} at ${s.p}`);
      const after=[upper.getWorldPosition(new Vector3()).distanceTo(lower.getWorldPosition(new Vector3())),lower.getWorldPosition(new Vector3()).distanceTo(foot.getWorldPosition(new Vector3()))];
      after.forEach((n,k)=>assert.ok(Math.abs(n-before[k])<1e-6));
      // Shoe toe projects 0.21m ahead. It must clear every tread beneath it.
      for(let step=0;step<ENTRY.steps;step++){
        const x=-5.4+step*.5,top=ENTRY.rise*(step+1)/ENTRY.steps;
        if(target[0]+.21>x-.25+1e-5 && target[0]-.09<x+.25-1e-5)
          assert.ok(target[1]>=top-.001,`shoe intersects tread ${step} at ${s.p}`);
      }
    }
  }
});
