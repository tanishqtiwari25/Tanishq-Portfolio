// Inspect the ACTUAL delivered anatomical GLB in the Three.js runtime.
// This is a numerical deformation audit, not approval of likeness or appearance.
import fs from 'node:fs/promises';
import path from 'node:path';
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
const mixer = new T.AnimationMixer(gltf.scene);
for (const clip of gltf.animations) {
  mixer.stopAllAction(); reset();
  const action = mixer.clipAction(clip);
  action.setLoop(T.LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  const report = { name: clip.name, duration: clip.duration, tracks: clip.tracks.map((track) => track.name), frames: [], worstEdges: [], maximumLoopPositionDelta: 0, maximumLoopAngleDegrees: 0 };
  let first;
  for (let frame = 0; frame <= 24; frame++) {
    const phase = frame / 24;
    action.time = Math.min(clip.duration - 1e-7, clip.duration * phase);
    mixer.update(0); gltf.scene.updateMatrixWorld(true);
    for (const mesh of meshes) mesh.skeleton.update();
    if (!first) first = rig.bones.map(bone => ({ position: bone.position.clone(), quaternion: bone.quaternion.clone() }));
    if (frame === 24) rig.bones.forEach((bone, i) => {
      report.maximumLoopPositionDelta = Math.max(report.maximumLoopPositionDelta, bone.position.distanceTo(first[i].position));
      report.maximumLoopAngleDegrees = Math.max(report.maximumLoopAngleDegrees, T.MathUtils.radToDeg(bone.quaternion.clone().normalize().angleTo(first[i].quaternion.clone().normalize())));
    });
    const snapshot = { phase, leftSoleY: Infinity, rightSoleY: Infinity, maximumCoincidentSeamGap: 0, maximumEdgeStretch: 1, collapsedTriangles: 0, extremeStretchTriangles: 0, lowestVertexY: Infinity };
    meshes.forEach((mesh, mi) => {
      const positions = vertices(mesh), geometry = mesh.geometry;
      const indices = geometry.index?.array || Array.from({ length: geometry.attributes.position.count }, (_, i) => i);
      const skinIndex = geometry.attributes.skinIndex, skinWeight = geometry.attributes.skinWeight;
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        const y = positions[i * 3 + 1];
        snapshot.lowestVertexY = Math.min(snapshot.lowestVertexY, y);
        const joint = rig.bones[skinIndex.getX(i)]?.name;
        if (skinWeight.getX(i) > .95 && (joint === 'LeftFoot' || joint === 'RightFoot')) {
          const key = joint === 'LeftFoot' ? 'leftSoleY' : 'rightSoleY';
          snapshot[key] = Math.min(snapshot[key], y);
        }
      }
      for (const group of seamGroups[mi]) {
        v.fromArray(positions, group[0] * 3);
        for (let i = 1; i < group.length; i++) snapshot.maximumCoincidentSeamGap = Math.max(snapshot.maximumCoincidentSeamGap, v.distanceTo(a.fromArray(positions, group[i] * 3)));
      }
      for (let i = 0; i < indices.length; i += 3) {
        const ids = [indices[i], indices[i + 1], indices[i + 2]];
        const restArea = area(base[mi], ...ids);
        if (restArea < 1e-10) continue;
        const ratio = area(positions, ...ids) / restArea;
        if (ratio < .05) snapshot.collapsedTriangles++;
        if (ratio > 3) snapshot.extremeStretchTriangles++;
        for (let edge = 0; edge < 3; edge++) {
          const x = ids[edge], y = ids[(edge + 1) % 3], before = distance(base[mi], x, y);
          if (before > .0001) {
            const after = distance(positions, x, y);
            snapshot.maximumEdgeStretch = Math.max(snapshot.maximumEdgeStretch, after / before);
            if (after - before > .005 && after / before > 1.5) {
              const material = [].concat(mesh.material)[0]?.name;
              const midpoint = Array.from(base[mi].subarray(x * 3, x * 3 + 3), (value, axis) => (value + base[mi][y * 3 + axis]) / 2);
              report.worstEdges.push({ phase, material, restLengthMetres: before, deformedLengthMetres: after, elongationMetres: after - before, stretchRatio: after / before, restMidpoint: midpoint });
              report.worstEdges.sort((a, b) => b.elongationMetres - a.elongationMetres);
              report.worstEdges.length = Math.min(report.worstEdges.length, 8);
            }
          }
        }
      }
    });
    report.frames.push(snapshot);
  }
  report.maxima = {
    edgeStretch: Math.max(...report.frames.map(frame => frame.maximumEdgeStretch)),
    seamGapMetres: Math.max(...report.frames.map(frame => frame.maximumCoincidentSeamGap)),
    collapsedTriangles: Math.max(...report.frames.map(frame => frame.collapsedTriangles)),
    extremeStretchTriangles: Math.max(...report.frames.map(frame => frame.extremeStretchTriangles)),
    belowGroundMetres: Math.max(0, -Math.min(...report.frames.map(frame => frame.lowestVertexY))),
  };
  summary.clips.push(report);
}
mixer.stopAllAction(); reset();
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ asset: summary.asset, bytes: summary.bytes, bones: rig.bones.length, primitives: meshes.length, clips: summary.clips.map(({ name, duration, maxima, maximumLoopPositionDelta, maximumLoopAngleDegrees }) => ({ name, duration, maxima, maximumLoopPositionDelta, maximumLoopAngleDegrees })), output }, null, 2));
