/**
 * A deliberately faceless development rig, never a photo-derived likeness.
 * Run from the project root: node scripts/build-arena-avatar.mjs
 * The final likeness requires an artist-built, identity-reviewed replacement.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
};

const output = path.resolve("public/models");
await fs.mkdir(output, { recursive: true });
const bones = [];
function bone(name, position, parent) {
  const joint = new THREE.Bone();
  joint.name = name;
  joint.position.set(...position);
  if (parent !== undefined) bones[parent].add(joint);
  bones.push(joint);
  return bones.length - 1;
}
const hip = bone("Hips", [0, 0.92, 0]);
const spine = bone("Spine", [0, 0.28, 0], hip);
const head = bone("Head", [0, 0.4, 0], spine);
const leftArm = bone("LeftArm", [-0.28, 0.2, 0], spine);
const leftForeArm = bone("LeftForeArm", [0, -0.3, 0], leftArm);
const rightArm = bone("RightArm", [0.28, 0.2, 0], spine);
const rightForeArm = bone("RightForeArm", [0, -0.3, 0], rightArm);
const leftThigh = bone("LeftUpLeg", [-0.13, 0, 0], hip);
const leftCalf = bone("LeftLeg", [0, -0.43, 0], leftThigh);
const leftFoot = bone("LeftFoot", [0, -0.44, 0], leftCalf);
const rightThigh = bone("RightUpLeg", [0.13, 0, 0], hip);
const rightCalf = bone("RightLeg", [0, -0.43, 0], rightThigh);
const rightFoot = bone("RightFoot", [0, -0.44, 0], rightCalf);

const root = new THREE.Group();
root.name = "Temporary_TT_Rig_Not_Likeness";
root.userData = {
  status: "development-placeholder",
  likeness: false,
  description:
    "Faceless procedural stand-in. Not a completed model of Tanishq.",
  units: "metres",
  walkCycleSeconds: 1.2,
  walkCycleDistanceMetres: 1.28,
};
root.add(bones[hip]);
root.updateMatrixWorld(true);

const parts = [];
function part(geometry, joint, material, offset = [0, 0, 0]) {
  const position = new THREE.Vector3().setFromMatrixPosition(
    bones[joint].matrixWorld,
  );
  geometry.translate(
    position.x + offset[0],
    position.y + offset[1],
    position.z + offset[2],
  );
  const count = geometry.attributes.position.count;
  const indices = new Uint16Array(count * 4);
  const weights = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    indices[i * 4] = joint;
    weights[i * 4] = 1;
  }
  geometry.setAttribute(
    "skinIndex",
    new THREE.Uint16BufferAttribute(indices, 4),
  );
  geometry.setAttribute(
    "skinWeight",
    new THREE.Float32BufferAttribute(weights, 4),
  );
  geometry.userData.material = material;
  parts.push(geometry);
}

// Human-scale articulating stand-in in the requested neutral TT outfit.
part(new THREE.BoxGeometry(0.5, 0.5, 0.26), spine, 0);
part(new THREE.BoxGeometry(0.38, 0.16, 0.23), hip, 2);
part(new THREE.SphereGeometry(0.145, 16, 12), head, 1, [0, 0.035, 0]);
part(new THREE.TorusGeometry(0.135, 0.045, 6, 16), spine, 0, [0, 0.28, -0.035]);
part(new THREE.PlaneGeometry(0.21, 0.1), spine, 4, [0, 0.07, 0.131]);
for (const joint of [leftArm, rightArm]) {
  part(new THREE.SphereGeometry(0.095, 8, 6), joint, 0);
  part(new THREE.CylinderGeometry(0.09, 0.08, 0.3, 8), joint, 0, [0, -0.15, 0]);
}
for (const joint of [leftForeArm, rightForeArm]) {
  part(
    new THREE.CylinderGeometry(0.08, 0.07, 0.27, 8),
    joint,
    0,
    [0, -0.13, 0],
  );
  part(new THREE.SphereGeometry(0.07, 8, 6), joint, 1, [0, -0.29, 0]);
}
for (const joint of [leftThigh, rightThigh])
  part(
    new THREE.CylinderGeometry(0.115, 0.085, 0.43, 8),
    joint,
    2,
    [0, -0.215, 0],
  );
for (const joint of [leftCalf, rightCalf])
  part(
    new THREE.CylinderGeometry(0.085, 0.065, 0.4, 8),
    joint,
    2,
    [0, -0.2, 0],
  );
for (const joint of [leftFoot, rightFoot])
  part(new THREE.BoxGeometry(0.16, 0.1, 0.29), joint, 3, [0, 0, 0.055]);

// Batch by material first, keeping the GLB to five skinned draw primitives.
const materialGroups = Array.from({ length: 5 }, (_, material) =>
  mergeGeometries(
    parts.filter((part) => part.userData.material === material),
    false,
  ),
);
const geometry = mergeGeometries(materialGroups, true);
const materials = [
  new THREE.MeshStandardMaterial({
    name: "Black_TT_hoodie",
    color: "#121419",
    roughness: 0.95,
  }),
  new THREE.MeshStandardMaterial({
    name: "Temporary_neutral_skin",
    color: "#95715d",
    roughness: 0.9,
  }),
  new THREE.MeshStandardMaterial({
    name: "Dark_trousers",
    color: "#25272c",
    roughness: 0.95,
  }),
  new THREE.MeshStandardMaterial({
    name: "Sneakers",
    color: "#dbdddf",
    roughness: 0.8,
  }),
  new THREE.MeshStandardMaterial({
    name: "Original_TT_mark",
    color: "#ffffff",
    roughness: 0.9,
  }),
];
const mesh = new THREE.SkinnedMesh(geometry, materials);
mesh.name = "Temporary_Avatar";
root.add(mesh);
mesh.bind(new THREE.Skeleton(bones));

function rotationTrack(name, axis, angles, times) {
  return new THREE.QuaternionKeyframeTrack(
    name + ".quaternion",
    times,
    angles.flatMap((angle) => {
      const euler = new THREE.Euler();
      euler[axis] = angle;
      return new THREE.Quaternion().setFromEuler(euler).toArray();
    }),
  );
}

const duration = 1.2;
const stride = 1.28;
const sampleCount = 49;
const times = Array.from(
  { length: sampleCount },
  (_, i) => (i / (sampleCount - 1)) * duration,
);
const hipPositions = [];
const tracks = [];
const walkValues = Object.fromEntries(
  [
    "LeftUpLeg",
    "LeftLeg",
    "LeftFoot",
    "RightUpLeg",
    "RightLeg",
    "RightFoot",
    "LeftArm",
    "RightArm",
    "LeftForeArm",
    "RightForeArm",
  ].map((name) => [name, []]),
);
function solveLeg(phase, hipY) {
  const u = (phase - 0.5) * 2;
  const swing = phase >= 0.5;
  const z = swing ? -0.32 + 0.64 * (u * u * (3 - 2 * u)) : 0.32 - phase * 1.28;
  const footY = 0.05 + (swing ? Math.sin(Math.PI * u) * 0.12 : 0);
  const dy = hipY - footY;
  const distance = Math.hypot(dy, z);
  const knee = Math.acos(
    THREE.MathUtils.clamp(
      (distance * distance - 0.43 ** 2 - 0.44 ** 2) / (2 * 0.43 * 0.44),
      -1,
      1,
    ),
  );
  const thigh =
    Math.atan2(-z, dy) -
    Math.atan2(0.44 * Math.sin(knee), 0.43 + 0.44 * Math.cos(knee));
  return { thigh, knee, foot: -thigh - knee };
}
for (let i = 0; i < sampleCount; i++) {
  const phase = i / (sampleCount - 1);
  const hipY = 0.84 + 0.012 * Math.cos(phase * Math.PI * 4);
  hipPositions.push(0, hipY, 0);
  for (const [prefix, offset] of [
    ["Left", 0],
    ["Right", 0.5],
  ]) {
    const leg = solveLeg((phase + offset) % 1, hipY);
    walkValues[prefix + "UpLeg"].push(leg.thigh);
    walkValues[prefix + "Leg"].push(leg.knee);
    walkValues[prefix + "Foot"].push(leg.foot);
    walkValues[prefix + "Arm"].push(
      0.27 * Math.sin((phase + offset) * Math.PI * 2),
    );
    walkValues[prefix + "ForeArm"].push(
      -0.12 - 0.06 * Math.sin((phase + offset) * Math.PI * 2),
    );
  }
}
tracks.push(
  new THREE.VectorKeyframeTrack("Hips.position", times, hipPositions),
);
for (const [name, values] of Object.entries(walkValues))
  tracks.push(rotationTrack(name, "x", values, times));
const clips = [
  new THREE.AnimationClip("EntranceWalk", duration, tracks),
  new THREE.AnimationClip("Idle", 2, [
    rotationTrack("Spine", "z", [0, 0.012, 0], [0, 1, 2]),
  ]),
  new THREE.AnimationClip("ConfidentPose", 1, [
    rotationTrack("LeftArm", "z", [-0.05, -0.18], [0, 1]),
    rotationTrack("RightArm", "z", [0.05, 0.18], [0, 1]),
  ]),
  new THREE.AnimationClip("Turn", 1, [
    rotationTrack("Hips", "y", [0, Math.PI], [0, 1]),
  ]),
];

// Check real bone placement before export. Stance soles must touch the ground.
const mixer = new THREE.AnimationMixer(root);
const action = mixer.clipAction(clips[0]);
action.play();
let lowestSole = Infinity;
let highestStanceSole = -Infinity;
for (let i = 0; i < sampleCount - 1; i++) {
  action.time = times[i];
  mixer.update(0);
  root.updateMatrixWorld(true);
  for (const [foot, offset] of [
    [leftFoot, 0],
    [rightFoot, 0.5],
  ]) {
    const phase = (i / (sampleCount - 1) + offset) % 1;
    const sole = new THREE.Vector3(0, -0.05, 0).applyMatrix4(
      bones[foot].matrixWorld,
    ).y;
    lowestSole = Math.min(lowestSole, sole);
    if (phase < 0.5)
      highestStanceSole = Math.max(highestStanceSole, Math.abs(sole));
  }
}
if (lowestSole < -0.001 || highestStanceSole > 0.001)
  throw new Error("Grounding validation failed.");
mixer.stopAllAction();
mesh.pose();
root.updateMatrixWorld(true);

const binary = Buffer.from(
  await new GLTFExporter().parseAsync(root, {
    binary: true,
    animations: clips,
  }),
);
const jsonLength = binary.readUInt32LE(12);
const document = JSON.parse(binary.subarray(20, 20 + jsonLength).toString());
const oldBin = binary.subarray(28 + jsonLength);
// Original fabric and chest-mark textures, embedded in the GLB. No external URLs.
const fabric = await sharp(
  Buffer.from(
    '<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg"><path fill="#b7b7b7" d="M0 0h64v64H0z"/><path stroke="#adadad" stroke-width="1" d="M0 0h64M0 4h64M0 8h64M0 12h64M0 16h64M0 20h64M0 24h64M0 28h64M0 32h64M0 36h64M0 40h64M0 44h64M0 48h64M0 52h64M0 56h64M0 60h64"/></svg>',
  ),
)
  .png()
  .toBuffer();
const mark = await sharp(
  Buffer.from(
    '<svg width="256" height="128" viewBox="0 0 256 128" xmlns="http://www.w3.org/2000/svg"><path fill="#121419" d="M0 0h256v128H0z"/><path fill="#eeeeef" d="M34 29h83v19H86v53H65V48H34zm103 0h84v19h-31v53h-22V48h-31z"/></svg>',
  ),
)
  .png()
  .toBuffer();
let chunks = [oldBin];
let offset = oldBin.length;
document.images = [];
document.textures = [];
document.samplers = [
  { magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 },
];
for (const image of [fabric, mark]) {
  document.bufferViews.push({
    buffer: 0,
    byteOffset: offset,
    byteLength: image.length,
  });
  document.images.push({
    bufferView: document.bufferViews.length - 1,
    mimeType: "image/png",
  });
  document.textures.push({ source: document.images.length - 1, sampler: 0 });
  const padding = Buffer.alloc((4 - (image.length % 4)) % 4);
  chunks.push(image, padding);
  offset += image.length + padding.length;
}
document.materials[0].pbrMetallicRoughness.baseColorTexture = { index: 0 };
document.materials[4].pbrMetallicRoughness.baseColorTexture = { index: 1 };
document.asset.extras = {
  status: "development-placeholder",
  identityValidated: false,
  groundedSampleToleranceMetres: 0.001,
};
const bin = Buffer.concat(chunks);
document.buffers[0].byteLength = bin.length;
let json = Buffer.from(JSON.stringify(document));
json = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 32)]);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + json.length + bin.length, 8);
header.writeUInt32LE(json.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(bin.length, 0);
binaryHeader.writeUInt32LE(0x004e4942, 4);
const glb = Buffer.concat([header, json, binaryHeader, bin]);
await fs.writeFile(path.join(output, "tt-temporary.glb"), glb);
const summary = {
  status: "DEVELOPMENT PLACEHOLDER — NOT A FACIAL LIKENESS",
  asset: "/models/tt-temporary.glb",
  heightMetres: 1.78,
  bones: bones.length,
  triangles: geometry.index.count / 3,
  bytes: glb.length,
  textures: ["64px original fabric PNG", "256px original TT chest mark PNG"],
  animations: clips.map(({ name, duration }) => ({ name, duration })),
  walkCycleDistanceMetres: stride,
  walkCycleSeconds: duration,
  sampledStanceSoleErrorMetres: Number(highestStanceSole.toFixed(6)),
  limitations: [
    "Faceless procedural body; no photo-derived facial reconstruction.",
    "Rigid single-joint weights are suitable for blocking, not a finished realistic character.",
    "No authored stairs or rope-entry animation.",
    "Runtime walk distance must be signed and synchronized to the 1.28m gait cycle.",
  ],
  replacementRequired:
    "Identity-reviewed Blender character with UV-mapped base color/normal/roughness textures, skinned skeleton, grounded rootless walk/turn/pose/idle clips and authored stairs/rope entry; export glTF 2.0 GLB at metre scale, +Y up, +Z facing, approximately 1.78m tall. Provide front/three-quarter/side renders for user approval before replacing this temporary asset.",
};
await fs.writeFile(
  path.join(output, "tt-temporary.asset.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
console.log(JSON.stringify(summary, null, 2));
