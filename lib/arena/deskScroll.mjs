export const DESK_SECTIONS = ["about", "skills", "experience", "education"];

// Reserve extra physical scroll distance for reading the four desk sections.
export function scrollToJourney(value) {
  const p = Math.max(0, Math.min(1, value));
  if (p < .6) return p / .6 * .8;
  if (p < .94) return .8 + (p - .6) / .34 * .15;
  return .95 + (p - .94) / .06 * .05;
}
export function journeyToScroll(value) {
  const p = Math.max(0, Math.min(1, value));
  if (p < .8) return p / .8 * .6;
  if (p < .95) return .6 + (p - .8) / .15 * .34;
  return .94 + (p - .95) / .05 * .06;
}
export function deskSectionAt(progress) {
  return DESK_SECTIONS[Math.max(0, Math.min(3, Math.floor((progress - .8) / .0375)))];
}
export function deskSectionProgress(section) {
  return .8 + Math.max(0, DESK_SECTIONS.indexOf(section)) * .0375 + .01;
}
