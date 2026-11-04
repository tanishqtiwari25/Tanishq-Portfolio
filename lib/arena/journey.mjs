import { RING_ENTRY, ringEntryPose } from "./ringEntry.mjs";
/** All positions are metres in one arena. Progress is reversible and has no time-dependent cuts. */
export const CHAPTERS = [
  { id: "entrance", label: "Your entrance", at: 0 },
  { id: "intro", label: "Intro reveal", at: 0.13 },
  { id: "ramp", label: "Walk to the ring", at: 0.4 },
  { id: "projects", label: "Explore projects", at: 0.64 },
  { id: "about", label: "About & skills", at: 0.83 },
  { id: "contact", label: "Let’s connect", at: 1 },
];
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));

// Canvas is 1.27 m above the floor. Five visible treads end at the apron opening.
export const ENTRY = { start: 0.53, end: RING_ENTRY.end, stairsEnd: RING_ENTRY.start, z: RING_ENTRY.z, rise: 1.27, steps: 5 };
const stairPoints = [
  [-5.9, 0, ENTRY.z],
  ...Array.from({ length: ENTRY.steps }, (_, i) => {
    const height = (ENTRY.rise * (i + 1)) / ENTRY.steps;
    // Lift from the previous support before moving over the next vertical riser.
    // Foot IK uses this paired lift/advance support contract.
    return [
      [i === 0 ? -5.9 : -5.4 + (i - 1) * 0.5, height, ENTRY.z],
      [i===ENTRY.steps-1 ? -3.6 : -5.4 + i * 0.5, height, ENTRY.z],
    ];
  }).flat(),
];
const stairDistances = stairPoints.map((point, i) =>
  i === 0 ? 0 : distance(stairPoints[i - 1], point),
);
const stairLength = stairDistances.reduce((sum, n) => sum + n, 0);

function sampleEntry(p) {
  if(p>=ENTRY.stairsEnd){
    const rope=ringEntryPose(p);
    return {position:rope.root,distance:stairLength+rope.root[0]+3.6,phase:"rope",
      pose:{stepIndex:ENTRY.steps,phase:"rope",progress:rope.q,from:[-3.6,ENTRY.rise,ENTRY.z],to:[-2.5,ENTRY.rise,ENTRY.z]}};
  }
  const travelled = clamp((p - ENTRY.start) / (ENTRY.stairsEnd - ENTRY.start)) * stairLength;
  let before = 0;
  for (let i = 0; i < stairPoints.length - 1; i++) {
    const segmentLength = stairDistances[i + 1];
    if (travelled <= before + segmentLength || i === stairPoints.length - 2) {
      const t = smooth((travelled - before) / segmentLength);
      const stepIndex = Math.floor(i / 2);
      const phase = i % 2 === 0 ? "lift" : "advance";
      const supportFrom = stepIndex * 2;
      const supportTo = supportFrom + 2;
      return {
        position: mix(stairPoints[i], stairPoints[i + 1], t),
        distance: before + segmentLength * t,
        phase,
        pose: {
          stepIndex,
          phase,
          progress: t,
          // A lift and its following advance share the same two foot supports.
          // Copies prevent a consumer from changing the deterministic root path.
          from: [...stairPoints[supportFrom]],
          to: [...stairPoints[supportTo]],
        },
      };
    }
    before += segmentLength;
  }
}

/** Continuous support-safe stair route followed by the coordinated rope entry. */
export function entryPosition(p) {
  return sampleEntry(p).position;
}

export function rampHeight(z) {
  if (z <= -33) return 1.1;
  if (z < -10) return 0.1 + (-10 - z) / 23;
  return 0.1 * clamp(-9 - z);
}

const frames = [
  { p: 0, c: [0, 2, -17], look: [0, 5.5, -40] },
  { p: 0.13, c: [-3.3, 2.1, -25.5], look: [0, 5.5, -40] },
  {
    p: 0.26,
    c: [-.4, 1.45, -26],
    look: [0, 4.3, 0],
  },
  { p: 0.46, c: [0, 1.45, -10], look: [0, 4.3, 0] },
  { p: 0.53, c: [-8, 3.2, -8], look: [-4, 1.8, ENTRY.z] },
  {
    p: 0.59,
    c: [-9, 4, -5],
    look: [0, 1.9, 0],
  },
  { p: .605, c: [-9,4,-5], look:[0,1.9,0] },
  {
    p: 0.64,
    c: [0, 2.6, 14.8],
    look: [0, 5.1, 1.2],
  },
  { p: 0.76, c: [0, 2.6, 14.8], look: [0, 5.1, 1.2] },
  { p: 0.83, c: [.7, 2.2, 15.8], look: [0, 1.6, 0] },
  { p: 0.92, c: [.7, 2.2, 15.8], look: [0, 1.6, 0] },
  { p: 1, c: [.7, 2.2, 15.8], look: [0, 1.6, 0] },
];

// Avatar routing is independent of the camera keys. The walk stops outside the
// near apron, rounds the corner on the floor, then approaches the left stairs.
// In particular, never interpolate [0,0,-3] through the solid ring platform.
const rampExit = 0.46;
const rampTravel = 13.5;
const avatarFrames = [
  { p: 0, avatar: [0, rampHeight(-23.6), -23.6] },
  { p: 0.13, avatar: [0.7, rampHeight(-29), -29] },
  { p: 0.26, avatar: [0, rampHeight(-19), -19] },
  { p: 0.26 + (rampExit - 0.26) * (9 / rampTravel), avatar: [0, rampHeight(-10), -10] },
  { p: 0.26 + (rampExit - 0.26) * (10 / rampTravel), avatar: [0, rampHeight(-9), -9] },
  { p: rampExit, avatar: [0, 0, -5.5] },
  { p: 0.495, avatar: [-5.9, 0, -5.5] },
  { p: ENTRY.start, avatar: stairPoints[0] },
  { p: ENTRY.end, avatar: [-2.5,ENTRY.rise,ENTRY.z] },
  ...frames.filter(frame => frame.p >= 0.64).map(({ p }) => ({ p, avatar: [0, ENTRY.rise, 0] })),
];
const distances = avatarFrames.map((frame, i) => {
  if (i === 0) return 0;
  if (frame.p === ENTRY.end) return stairLength+1.1;
  return distance(avatarFrames[i - 1].avatar, frame.avatar);
});
const entryDistanceBefore = distances
  .slice(0, avatarFrames.findIndex(frame => frame.p === ENTRY.start) + 1)
  .reduce((sum, n) => sum + n, 0);

function sampleAvatar(p) {
  let i = avatarFrames.findIndex(
    (frame, n) => n < avatarFrames.length - 1 && p >= frame.p && p < avatarFrames[n + 1].p,
  );
  if (i < 0) i = avatarFrames.length - 2;
  const a = avatarFrames[i], b = avatarFrames[i + 1];
  const raw = clamp((p - a.p) / (b.p - a.p));
  const before = distances.slice(0, i + 1).reduce((sum, n) => sum + n, 0);
  if (p >= ENTRY.start && p <= ENTRY.end) {
    const entry = sampleEntry(p);
    return { avatar: entry.position, distance: entryDistanceBefore + entry.distance, direction: [1, 0, 0], entryPhase: entry.phase, entryPose: entry.pose };
  }
  const avatar = mix(a.avatar, b.avatar, raw);
  if (p <= rampExit) avatar[1] = rampHeight(avatar[2]);
  return {
    avatar,
    distance: before + distance(a.avatar, avatar),
    direction: b.avatar.map((v, axis) => v - a.avatar[axis]),
    entryPhase: null,
    entryPose: null,
  };
}

export function sampleJourney(value) {
  const p = clamp(Number.isFinite(value) ? value : 0);
  let i = frames.findIndex(
    (f, n) => n < frames.length - 1 && p >= f.p && p <= frames[n + 1].p,
  );
  if (i < 0) i = frames.length - 2;
  const a = frames[i],
    b = frames[i + 1],
    raw = clamp((p - a.p) / (b.p - a.p));
  const { avatar, distance: travelled, direction, entryPhase, entryPose } = sampleAvatar(p);
  return {
    p,
    camera: mix(a.c, b.c, smooth(raw)),
    look: mix(a.look, b.look, smooth(raw)),
    fov: 45 + 15 * smooth((p - .21) / .07) * (1 - smooth((p - .46) / .14)) + 10 * smooth((p - .76) / .07),
    avatar,
    distance: travelled,
    entryPhase,
    entryPose,
    avatarYaw:
      Math.hypot(direction[0], direction[2]) > 0.001
        ? Math.atan2(direction[0], direction[2])
        : 0,
    chapter: p < 0.09 ? 0 : p < 0.21 ? 1 : p < 0.61 ? 2 : p < 0.8 ? 3 : p < 0.95 ? 4 : 5,
  };
}
