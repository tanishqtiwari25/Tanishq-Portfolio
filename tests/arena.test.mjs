import test from "node:test";
import assert from "node:assert/strict";
import {
  sampleJourney,
  entryPosition,
  rampHeight,
  ENTRY,
} from "../lib/arena/journey.mjs";
const length = (a, b) => Math.hypot(...a.map((n, i) => n - b[i]));

test("camera, avatar and stride retrace the same continuous world on reverse scroll", () => {
  const points = Array.from({ length: 101 }, (_, i) => i / 100);
  const first = points.map(sampleJourney);
  assert.deepEqual(
    points.slice().reverse().map(sampleJourney).reverse(),
    first,
  );
});

test("camera and avatar have no discontinuity at frame or stair boundaries", () => {
  let old = sampleJourney(0);
  for (let n = 1; n <= 10000; n++) {
    const now = sampleJourney(n / 10000);
    assert.ok(length(now.camera, old.camera) < 0.1, "camera jump");
    assert.ok(length(now.avatar, old.avatar) < 0.06, "avatar jump");
    assert.ok(now.camera.every(Number.isFinite));
    assert.ok(
      now.distance >= old.distance - 0.00001,
      "stride distance reverses while moving forward",
    );
    old = now;
  }
});

test("walking roots match the ramp surface and visible five-step staircase", () => {
  assert.equal(rampHeight(-33), 1.1);
  assert.equal(rampHeight(-10), 0.1);
  assert.equal(rampHeight(-9), 0);
  for (let p = 0.13; p < 0.46; p += 0.001) {
    const avatar = sampleJourney(p).avatar;
    assert.equal(avatar[1], rampHeight(avatar[2]));
  }
  assert.deepEqual(entryPosition(ENTRY.start), [-5.9, 0, ENTRY.z]);
  assert.deepEqual(entryPosition(ENTRY.end), [-2.5, ENTRY.rise, ENTRY.z]);
  assert.deepEqual(
    sampleJourney(ENTRY.start).avatar,
    entryPosition(ENTRY.start),
  );
  assert.deepEqual(sampleJourney(ENTRY.end).avatar, entryPosition(ENTRY.end));
});

test("progress clamps invalid and out-of-range input without exposing NaN transforms", () => {
  assert.deepEqual(sampleJourney(-1), sampleJourney(0));
  assert.deepEqual(sampleJourney(NaN), sampleJourney(0));
  assert.deepEqual(sampleJourney(2), sampleJourney(1));
});
