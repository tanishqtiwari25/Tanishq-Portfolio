export function initialQuality({ mobile = false, cores = 4, memory = 4, saveData = false } = {}) {
  if (mobile || cores <= 4 || memory <= 4 || saveData) return 0;
  return cores >= 12 && memory >= 8 ? 2 : 1;
}

export const QUALITY = [
  { dpr: .75, crowd: 480, shadows: false, effects: false },
  { dpr: 1, crowd: 1600, shadows: false, effects: false },
  { dpr: 1.25, crowd: 4480, shadows: true, effects: true },
];

// Downshift only after sustained slow rendering; never oscillate quality.
export function nextQuality(quality, averageMs) {
  return averageMs > 34 ? Math.max(0, quality - 1) : quality;
}
