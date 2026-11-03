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
export const ENTRY = { start: 0.53, end: 0.59, z: -2.45, rise: 1.27, steps: 5 };
const stairPoints = [
  [-5.9, 0, ENTRY.z],
  ...Array.from({ length: ENTRY.steps }, (_, i) => [
    -5.4 + i * 0.5,
    (ENTRY.rise * (i + 1)) / ENTRY.steps,
    ENTRY.z,
  ]),
  [-2.5, ENTRY.rise, ENTRY.z],
];

/** A continuous development transition matching the physical steps, not a finished climb animation. */
export function entryPosition(p) {
  const scaled =
    clamp((p - ENTRY.start) / (ENTRY.end - ENTRY.start)) *
    (stairPoints.length - 1);
  const i = Math.min(stairPoints.length - 2, Math.floor(scaled));
  return mix(stairPoints[i], stairPoints[i + 1], smooth(scaled - i));
}

export function rampHeight(z) {
  if (z <= -33) return 1.1;
  if (z < -10) return 0.1 + (-10 - z) / 23;
  return 0.1 * clamp(-9 - z);
}

const frames = [
  { p: 0, c: [0, 2, -17], look: [0, 5.5, -40], avatar: [0, rampHeight(-23.6), -23.6] },
  { p: 0.13, c: [-3.3, 2.1, -25.5], look: [0, 5.5, -40], avatar: [.7, rampHeight(-29), -29] },
  {
    p: 0.26,
    c: [-.4, 1.45, -26],
    look: [0, 4.3, 0],
    avatar: [0, rampHeight(-19), -19],
  },
  { p: 0.46, c: [0, 1.45, -10], look: [0, 4.3, 0], avatar: [0, 0, -3] },
  { p: 0.53, c: [-8, 3.2, -8], look: [-4, 1.8, -2.45], avatar: stairPoints[0] },
  {
    p: 0.59,
    c: [-9, 4, -5],
    look: [0, 1.9, 0],
    avatar: stairPoints[stairPoints.length - 1],
  },
  {
    p: 0.64,
    c: [0, 2.6, 14.8],
    look: [0, 5.1, 1.2],
    avatar: [0, ENTRY.rise, 0],
  },
  { p: 0.76, c: [0, 2.6, 14.8], look: [0, 5.1, 1.2], avatar: [0, ENTRY.rise, 0] },
  { p: 0.83, c: [.55, 2.45, 16.3], look: [0, 2, 0], avatar: [0, ENTRY.rise, 0] },
  { p: 0.92, c: [.55, 2.45, 16.3], look: [0, 2, 0], avatar: [0, ENTRY.rise, 0] },
  { p: 1, c: [.55, 2.45, 16.3], look: [0, 2, 0], avatar: [0, ENTRY.rise, 0] },
];
const distances = frames.map((frame, i) => {
  if (i === 0) return 0;
  if (i === 5)
    return stairPoints
      .slice(1)
      .reduce((n, point, j) => n + distance(stairPoints[j], point), 0);
  return distance(frames[i - 1].avatar, frame.avatar);
});

export function sampleJourney(value) {
  const p = clamp(Number.isFinite(value) ? value : 0);
  let i = frames.findIndex(
    (f, n) => n < frames.length - 1 && p >= f.p && p <= frames[n + 1].p,
  );
  if (i < 0) i = frames.length - 2;
  const a = frames[i],
    b = frames[i + 1],
    raw = clamp((p - a.p) / (b.p - a.p));
  let avatar = mix(a.avatar, b.avatar, raw);
  if (p >= ENTRY.start && p <= ENTRY.end) avatar = entryPosition(p);
  else if (p >= 0.13 && p <= 0.46) avatar[1] = rampHeight(avatar[2]);
  let travelled = distances.slice(0, i + 1).reduce((sum, n) => sum + n, 0);
  if (i === 4) {
    const scaled = raw * (stairPoints.length - 1),
      step = Math.min(stairPoints.length - 2, Math.floor(scaled));
    travelled += stairPoints
      .slice(1, step + 1)
      .reduce((sum, point, j) => sum + distance(stairPoints[j], point), 0);
    travelled += distance(stairPoints[step], avatar);
  } else travelled += distance(a.avatar, avatar);
  const direction =
    i === 4 ? [1, 0, 0] : b.avatar.map((v, axis) => v - a.avatar[axis]);
  return {
    p,
    camera: mix(a.c, b.c, smooth(raw)),
    look: mix(a.look, b.look, smooth(raw)),
    fov: 45 + 15 * smooth((p - .21) / .07) * (1 - smooth((p - .46) / .14)) + 10 * smooth((p - .76) / .07),
    avatar,
    distance: travelled,
    avatarYaw:
      Math.hypot(direction[0], direction[2]) > 0.001
        ? Math.atan2(direction[0], direction[2])
        : 0,
    chapter: p < 0.09 ? 0 : p < 0.21 ? 1 : p < 0.61 ? 2 : p < 0.8 ? 3 : p < 0.95 ? 4 : 5,
  };
}
