// Inspect the ACTUAL delivered anatomical GLB in the Three.js runtime.
// This is a numerical deformation audit, not approval of likeness or appearance.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createContactRig} from '../lib/arena/characterPose.mjs';
import {RING_ENTRY,ringEntryPose} from '../lib/arena/ringEntry.mjs';
import * as T from 'three';
import sharp from 'sharp';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

globalThis.self = globalThis;
// GLTFLoader's WebP capability probe uses Image; decode that probe with sharp.
globalThis.Image = class {
  set src(value) {
    fetch(value).then(response => response.arrayBuffer()).then(buffer => sharp(Buffer.from(buffer)).metadata()).then(info => {
      this.width = info.width; this.height = info.height; this.onload?.();
    }).catch(() => this.onerror?.());
  }
};
globalThis.createImageBitmap = async (blob) => {
  const { data, info } = await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, close() {} };
};
const file = process.argv[2] || 'public/models/tt-opening-performer.glb';
const output = process.argv[3] || 'art/tt-arena/entry-fix/anatomical-deformation-audit.json';
const bytes = await fs.readFile(file);
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');

const root=new T.Group();root.add(gltf.scene);const rig=createContactRig(gltf.scene),mixer=new T.AnimationMixer(gltf.scene),clip=gltf.animations.find(c=>c.name==='RingEntry');if(!clip)throw new Error('No entry clip');
const action=mixer.clipAction(clip);action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;action.play();const frames=[];
const phases=Array.from({length:241},(_,i)=>i/240);phases.push(...phases.slice().reverse());
for(const q of phases){
  const p=RING_ENTRY.start+(RING_ENTRY.end-RING_ENTRY.start)*q,pose=ringEntryPose(p);root.position.fromArray(pose.root);root.rotation.y=Math.PI/2;
  action.time=q*clip.duration;mixer.update(0);root.updateMatrixWorld(true);
  const footErrors=rig.legs.map((leg,i)=>leg.foot.getWorldPosition(new T.Vector3()).distanceTo(new T.Vector3(...(i===0?pose.left:pose.right)).add(new T.Vector3(0,.05,0))));
  const handErrors=pose.grip>.999?rig.arms.map((arm,i)=>arm.palm.getWorldPosition(new T.Vector3()).distanceTo(new T.Vector3(...pose.hands[i]))):[];
  const held=rig.bones.map(b=>b.quaternion.clone());for(let k=0;k<5;k++)mixer.update(0);
  const holdError=Math.max(...rig.bones.map((b,i)=>b.quaternion.angleTo(held[i])));
  frames.push({q,footErrors,handErrors,holdError});
}
const summary={asset:file,samples:frames.length,maxFootError:Math.max(...frames.flatMap(f=>f.footErrors)),maxHandContactError:Math.max(...frames.flatMap(f=>f.handErrors)),maxHeldQuaternionError:Math.max(...frames.map(f=>f.holdError)),frames};
await fs.writeFile(output,JSON.stringify(summary,null,2));console.log({asset:file,samples:summary.samples,maxFootError:summary.maxFootError,maxHandContactError:summary.maxHandContactError,maxHeldQuaternionError:summary.maxHeldQuaternionError});
if(summary.maxFootError>.008||summary.maxHandContactError>.012||summary.maxHeldQuaternionError>1e-5)process.exitCode=1;
