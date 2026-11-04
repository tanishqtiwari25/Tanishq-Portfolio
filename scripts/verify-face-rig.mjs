// Compare the delivered face derivative with the previous live performance.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as T from 'three';
import sharp from 'sharp';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
globalThis.self=globalThis;
globalThis.Image=class{set src(value){fetch(value).then(r=>r.arrayBuffer()).then(b=>sharp(Buffer.from(b)).metadata()).then(i=>{this.width=i.width;this.height=i.height;this.onload?.();}).catch(()=>this.onerror?.());}};
globalThis.createImageBitmap=async blob=>{const {data,info}=await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({resolveWithObject:true});return {data,width:info.width,height:info.height,close(){}};};
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
async function load(file){const b=await fs.readFile(file);return loader.parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');}
const before=await load('public/models/tt-contact-performer.glb'),after=await load(process.argv[2]||'public/models/tt-face-performer.glb');
const bones=[];before.scene.traverse(o=>{if(o.isBone)bones.push(o.name);});
assert.equal(bones.length,13);
for(const name of bones)assert(after.scene.getObjectByName(name)?.isBone,name);
const results=[];let worst=0;
for(const clip of before.animations){
  const next=after.animations.find(c=>c.name===clip.name);assert(next,clip.name);
  assert(Math.abs(next.duration-clip.duration)<.05,'Clip timing changed');
  const a=new T.AnimationMixer(before.scene),b=new T.AnimationMixer(after.scene);
  a.clipAction(clip).play();b.clipAction(next).play();let delta=0;
  for(let i=0;i<=24;i++){
    const time=Math.min(clip.duration,next.duration)*i/25;a.setTime(time);b.setTime(time);
    before.scene.updateMatrixWorld(true);after.scene.updateMatrixWorld(true);
    for(const name of bones){
      const x=before.scene.getObjectByName(name),y=after.scene.getObjectByName(name);
      delta=Math.max(delta,x.getWorldPosition(new T.Vector3()).distanceTo(y.getWorldPosition(new T.Vector3())));
    }
  }
  worst=Math.max(worst,delta);results.push({clip:clip.name,maxBonePositionErrorMetres:delta});
  a.stopAllAction();b.stopAllAction();
}
const report={bones:13,clips:results,worst,preserved:worst<.002};
await fs.writeFile(process.argv[3]||'art/tt-arena/face-likeness/animation-comparison.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));assert(report.preserved,'Export changed the performance');
