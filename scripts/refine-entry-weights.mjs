// Bounded skin-weight/clip refinement. Mesh positions, UVs, normals, materials,
// textures and source files stay unchanged. Outputs a separate review candidate.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const source = process.argv[2] || 'art/tt-arena/entrance-assets/SK_Opening_Performer-verified.glb';
const output = process.argv[3] || 'art/tt-arena/entry-fix/tt-performer-entry-candidate.glb';
const pelvisAnchor = Number(process.argv[4] ?? .55);
if (!(pelvisAnchor >= 0 && pelvisAnchor <= 1)) throw new Error('Pelvis anchor must be between zero and one.');
const smoothingIterations = Number(process.argv[5] ?? 16);
if (!(Number.isInteger(smoothingIterations) && smoothingIterations >= 0 && smoothingIterations <= 80)) throw new Error('Invalid smoothing iterations.');
const original = await fs.readFile(source);
const jsonLength = original.readUInt32LE(12);
const document = JSON.parse(original.subarray(20, 20 + jsonLength));
if (document.extensionsRequired?.includes('EXT_meshopt_compression')) throw new Error('Use the verified uncompressed source.');
const binary = original.subarray(28 + jsonLength);
const chunks = [binary];
let cursor = binary.length;
const widths = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
function read(index) {
  const a = document.accessors[index], view = document.bufferViews[a.bufferView];
  const sizes = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 };
  const methods = { 5121: 'readUInt8', 5123: 'readUInt16LE', 5125: 'readUInt32LE', 5126: 'readFloatLE' };
  const width = widths[a.type], size = sizes[a.componentType], stride = view.byteStride || size * width;
  const offset = (view.byteOffset || 0) + (a.byteOffset || 0);
  return Array.from({ length: a.count }, (_, i) => Array.from({ length: width }, (_, k) => binary[methods[a.componentType]](offset + i * stride + k * size)));
}
function append(values, width, componentType, type, target) {
  const array = componentType === 5121 ? new Uint8Array(values.flat()) : new Float32Array(values.flat());
  const padding = (4 - cursor % 4) % 4;
  if (padding) { chunks.push(Buffer.alloc(padding)); cursor += padding; }
  const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  const view = document.bufferViews.length;
  document.bufferViews.push({ buffer: 0, byteOffset: cursor, byteLength: bytes.length, ...(target ? { target } : {}) });
  chunks.push(bytes); cursor += bytes.length;
  const accessor = { bufferView: view, componentType, count: array.length / width, type };
  if (type === 'SCALAR') { accessor.min = [Math.min(...array)]; accessor.max = [Math.max(...array)]; }
  document.accessors.push(accessor);
  return document.accessors.length - 1;
}
const names = document.skins[0].joints.map(index => document.nodes[index].name);
const hips = names.indexOf('Hips');
if (hips < 0 || names.length !== 13) throw new Error('Unexpected skeleton.');
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function region([x, y]) {
  const pelvis = smooth(.66, .79, y) * (1 - smooth(.96, 1.07, y)) * (1 - smooth(.06, .17, Math.abs(x)));
  const axilla = smooth(.13, .18, Math.abs(x)) * (1 - smooth(.30, .35, Math.abs(x))) * smooth(1.10, 1.21, y) * (1 - smooth(1.43, 1.52, y));
  return { pelvis, axilla, strength: Math.max(pelvis, axilla) };
}
const refinement = [];
for (const mesh of document.meshes) for (const primitive of mesh.primitives) {
  const material = document.materials[primitive.material]?.name;
  if (material !== 'M_Authored_Padded_Jacket_Jeans') continue;
  const positions = read(primitive.attributes.POSITION), joints = read(primitive.attributes.JOINTS_0), weights = read(primitive.attributes.WEIGHTS_0);
  const indices = read(primitive.indices).flat();
  const canonical = [], groups = [], keyMap = new Map();
  positions.forEach((p, i) => {
    const key = p.map(n => Math.round(n * 1e6)).join(',');
    if (!keyMap.has(key)) { keyMap.set(key, groups.length); groups.push({ position: p, entries: [], neighbors: new Set(), initial: Array(names.length).fill(0) }); }
    const id = keyMap.get(key); canonical.push(id); groups[id].entries.push(i);
    joints[i].forEach((joint, k) => groups[id].initial[joint] += weights[i][k]);
  });
  for (const group of groups) group.initial = group.initial.map(weight => weight / group.entries.length);
  for (let i = 0; i < indices.length; i += 3) for (let edge = 0; edge < 3; edge++) {
    const a = canonical[indices[i + edge]], b = canonical[indices[i + (edge + 1) % 3]];
    if (a !== b) { groups[a].neighbors.add(b); groups[b].neighbors.add(a); }
  }
  // Link the paired inner/outer cloth shells so their weights do not diverge.
  const buckets = new Map(), cell = .006;
  groups.forEach((group, id) => { const key = group.position.map(n => Math.floor(n / cell)).join(','); if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(id); });
  groups.forEach((group, id) => {
    if (region(group.position).strength < .001) return;
    const base = group.position.map(n => Math.floor(n / cell));
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      for (const other of buckets.get([base[0] + x, base[1] + y, base[2] + z].join(',')) || []) {
        if (other === id) continue;
        const squared = group.position.reduce((n, value, axis) => n + (value - groups[other].position[axis]) ** 2, 0);
        if (squared < .004 ** 2) { group.neighbors.add(other); groups[other].neighbors.add(id); }
      }
    }
  });
  let current = groups.map(group => [...group.initial]);
  for (let iteration = 0; iteration < smoothingIterations; iteration++) {
    current = groups.map((group, id) => {
      const influence = region(group.position).strength;
      if (influence < .001 || group.neighbors.size === 0) return current[id];
      const average = Array(names.length).fill(0); let sum = 0;
      for (const neighbor of group.neighbors) {
        const length = Math.hypot(...group.position.map((n, k) => n - groups[neighbor].position[k]));
        const factor = 1 / Math.max(.004, length);
        sum += factor;
        for (let joint = 0; joint < names.length; joint++) average[joint] += current[neighbor][joint] * factor;
      }
      return current[id].map((weight, joint) => weight * (1 - .5 * influence) + average[joint] / sum * .5 * influence);
    });
  }
  let modified = 0;
  for (let id = 0; id < groups.length; id++) {
    const group = groups[id], { pelvis } = region(group.position);
    // Stabilize the short centre crotch on the pelvis; smoothly leave thighs free.
    const anchor = pelvis * pelvisAnchor;
    const values = current[id].map((weight, joint) => weight * (1 - anchor) + (joint === hips ? anchor : 0));
    const entries = values.map((weight, joint) => [joint, weight]).filter(([, weight]) => weight > 1e-6).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const sum = entries.reduce((n, [, weight]) => n + weight, 0);
    for (const index of group.entries) {
      const replacementWeights = [0, 0, 0, 0], replacementJoints = [0, 0, 0, 0];
      entries.forEach(([joint, weight], k) => { replacementJoints[k] = joint; replacementWeights[k] = weight / sum; });
      if (replacementWeights.some((weight, k) => Math.abs(weight - weights[index][k]) > 1e-6) || replacementJoints.some((joint, k) => joint !== joints[index][k])) modified++;
      weights[index] = replacementWeights; joints[index] = replacementJoints;
    }
  }
  primitive.attributes.JOINTS_0 = append(joints, 4, 5121, 'VEC4', 34962);
  primitive.attributes.WEIGHTS_0 = append(weights, 4, 5126, 'VEC4', 34962);
  refinement.push({ material, vertices: positions.length, canonicalPositions: groups.length, modifiedVertices: modified, smoothingIterations, pelvisAnchorMaximum: pelvisAnchor });
}
const walk = document.animations.find(animation => animation.name === 'EntranceWalk');
if (!walk) throw new Error('Walk clip missing.');
const closedSamplers = [];
for (const sampler of walk.samplers) {
  if (sampler.interpolation && !['LINEAR', 'STEP'].includes(sampler.interpolation)) throw new Error('Only linear/constant exported tracks are supported.');
  const times = read(sampler.input), values = read(sampler.output);
  const oldEnd = times.at(-1)[0];
  if (oldEnd >= 1.2 - 1e-6) continue;
  if (sampler.interpolation === 'STEP' && values[0].some((n, i) => Math.abs(n - values.at(-1)[i]) > 1e-5)) throw new Error('Changing STEP track needs explicit review.');
  const width = values[0].length, type = document.accessors[sampler.output].type;
  times.push([1.2]); values.push([...values[0]]);
  sampler.input = append(times, 1, 5126, 'SCALAR');
  sampler.output = append(values, width, 5126, type);
  closedSamplers.push({ from: oldEnd, to: 1.2 });
}
document.asset.extras = { ...(document.asset.extras || {}), entryRefinement: 'Local pelvis/crotch and axilla skin-weight smoothing; UV/material seams retained; walk duplicate endpoint restored at1.2s. Anonymous anatomical model, not a validated owner likeness.' };
const pad = (4 - cursor % 4) % 4;
if (pad) { chunks.push(Buffer.alloc(pad)); cursor += pad; }
document.buffers[0].byteLength = cursor;
const bin = Buffer.concat(chunks), rawJson = Buffer.from(JSON.stringify(document));
const json = Buffer.concat([rawJson, Buffer.alloc((4 - rawJson.length % 4) % 4, 32)]);
const header = Buffer.alloc(20), binaryHeader = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4); header.writeUInt32LE(28 + json.length + bin.length, 8); header.writeUInt32LE(json.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
binaryHeader.writeUInt32LE(bin.length, 0); binaryHeader.writeUInt32LE(0x004e4942, 4);
const result = Buffer.concat([header, json, binaryHeader, bin]);
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, result);
const manifest = { source, sourceSha256: crypto.createHash('sha256').update(original).digest('hex'), output, outputSha256: crypto.createHash('sha256').update(result).digest('hex'), bytes: result.length, geometryPositionsChanged: false, materialOrTextureChanges: false, refinement, walkSamplersClosed: closedSamplers.length, closedSamplers, status: 'Candidate pending deformation and visual review; no public model overwritten.' };
await fs.writeFile(output.replace(/\.glb$/, '-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ ...manifest, closedSamplers: undefined }, null, 2));
