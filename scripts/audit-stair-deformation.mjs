// Inspect the ACTUAL delivered anatomical GLB in the Three.js runtime.
// This is a numerical deformation audit, not approval of likeness or appearance.
import fs from 'node:fs/promises';
import path from 'node:path';
import {sampleJourney,ENTRY} from '../lib/arena/journey.mjs';
import {stairFootTargets,placeLeg} from '../lib/arena/characterPose.mjs';
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
const meshes = [];
gltf.scene.traverse((object) => { if (object.isSkinnedMesh) meshes.push(object); });
const rig = meshes[0]?.skeleton;
if (!rig) throw new Error('Expected a skinned GLB.');
const rest = rig.bones.map((bone) => ({ name: bone.name, position: bone.position.clone(), quaternion: bone.quaternion.clone(), scale: bone.scale.clone() }));
function reset() {
  rig.bones.forEach((bone, index) => {
    const pose = rest[index];
    bone.position.copy(pose.position);
    bone.quaternion.copy(pose.quaternion);
    bone.scale.copy(pose.scale);
  });
  gltf.scene.updateMatrixWorld(true);
  for (const mesh of meshes) mesh.skeleton.update();
}
function vertices(mesh) {
  const result = new Float64Array(mesh.geometry.attributes.position.count * 3);
  const v = new T.Vector3();
  for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
    mesh.getVertexPosition(i, v);
    v.applyMatrix4(mesh.matrixWorld);
    result.set(v.toArray(), i * 3);
  }
  return result;
}
reset();
const base = meshes.map((mesh) => vertices(mesh));
const v = new T.Vector3(), a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3();
function area(points, ia, ib, ic) {
  a.fromArray(points, ia * 3); b.fromArray(points, ib * 3).sub(a); c.fromArray(points, ic * 3).sub(a);
  return b.cross(c).length() / 2;
}
function distance(points, ia, ib) {
  return a.fromArray(points, ia * 3).distanceTo(b.fromArray(points, ib * 3));
}
const seamGroups = meshes.map((mesh, mi) => {
  const groups = new Map();
  for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
    const key = Array.from(base[mi].subarray(i * 3, i * 3 + 3), n => Math.round(n * 1e6)).join(',');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  return [...groups.values()].filter((group) => group.length > 1);
});
const summary = {
  asset: file,
  bytes: bytes.length,
  status: 'Runtime geometry audit only; appearance, cloth intersections and likeness require visual review.',
  skeleton: rig.bones.map((bone) => ({ name: bone.name, parent: bone.parent?.name })),
  skinnedPrimitives: meshes.length,
  materials: meshes.flatMap((mesh) => [].concat(mesh.material).map((material) => material.name)),
  clips: [],
  limitations: ['No stairs/rope-entry clip exists unless listed explicitly.', 'Edge/area measurements identify extreme deformation but cannot certify self-intersection or garment quality.', 'Contact measurements are in untransformed asset coordinates; arena floor/ramp placement must be verified separately.'],
};

const parent=new T.Group();parent.add(gltf.scene);
const hips=gltf.scene.getObjectByName('Hips'),hipsY=hips.position.y;
const feetRest=['Left','Right'].map(side=>gltf.scene.getObjectByName(side+'Foot').getWorldQuaternion(new T.Quaternion()));
const frames=[];
for(let frame=0;frame<=120;frame++){
  reset();const sample=sampleJourney(ENTRY.start+(ENTRY.end-ENTRY.start)*frame/120);
  parent.position.fromArray(sample.avatar);parent.rotation.y=Math.PI/2;
  const targets=stairFootTargets(sample.entryPose,sample.avatar);
  hips.position.y=hipsY+targets.pelvis;parent.updateMatrixWorld(true);
  ['Left','Right'].forEach((side,i)=>placeLeg(gltf.scene.getObjectByName(side+'UpLeg'),gltf.scene.getObjectByName(side+'Leg'),gltf.scene.getObjectByName(side+'Foot'),i===0?targets.left:targets.right,new T.Vector3(1,0,0),parent.quaternion.clone().multiply(feetRest[i])));
  parent.updateMatrixWorld(true);meshes.forEach(m=>m.skeleton.update());
  const report={p:sample.p,phase:sample.entryPose.phase,maxStretch:1,collapsed:0,collapseDetails:[],extreme:0,seamGap:0};
  meshes.forEach((mesh,mi)=>{
    const points=vertices(mesh),ids=mesh.geometry.index?.array??Array.from({length:points.length/3},(_,i)=>i);
    for(const group of seamGroups[mi])for(const j of group)report.seamGap=Math.max(report.seamGap,distance(points,group[0],j));
    for(let j=0;j<ids.length;j+=3){
      const tri=[ids[j],ids[j+1],ids[j+2]],before=area(base[mi],...tri);if(before<1e-10)continue;
      const ratio=area(points,...tri)/before;if(ratio<.05){report.collapsed++;report.collapseDetails.push({material:mesh.material.name,restArea:before,ratio,midpoint:tri.map(i=>Array.from(base[mi].subarray(i*3,i*3+3)))});}if(ratio>3)report.extreme++;
      for(let edge=0;edge<3;edge++){const a=tri[edge],b=tri[(edge+1)%3],d=distance(base[mi],a,b);if(d>.0001)report.maxStretch=Math.max(report.maxStretch,distance(points,a,b)/d);}
    }
  });frames.push(report);
}
await fs.writeFile(output,JSON.stringify({asset:file,scope:'Actual compressed web mesh under runtime stair IK; does not certify self-intersection or likeness',frames,maxima:{stretch:Math.max(...frames.map(x=>x.maxStretch)),collapsed:Math.max(...frames.map(x=>x.collapsed)),extreme:Math.max(...frames.map(x=>x.extreme)),seamGap:Math.max(...frames.map(x=>x.seamGap))}},null,2));
console.log(frames.reduce((a,b)=>b.maxStretch>a.maxStretch?b:a));
