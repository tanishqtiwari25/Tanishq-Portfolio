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
    assert.ok(Math.abs(now.fov - old.fov) < 0.04, "lens jump");
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

test("the walk rounds the solid apron with body clearance before climbing", () => {
  // Geometry contract: 7m square base, 1.27m canvas and 0.11m corner posts.
  // A root-only point test missed the original floor-level diagonal through it.
  const bodyRadius = 0.35;
  for (let n = 2100; n <= 10000; n++) {
    const p = n / 10000;
    const [x, y, z] = sampleJourney(p).avatar;
    const apronDistance = Math.hypot(
      Math.max(Math.abs(x) - 3.5, 0),
      Math.max(Math.abs(z) - 3.5, 0),
    );
    assert.ok(
      y >= 1.27 - 1e-9 || apronDistance >= bodyRadius - 1e-9,
      `avatar body enters the solid apron at progress ${p}`,
    );
    for (const postX of [-3.45, 3.45]) {
      for (const postZ of [-3.45, 3.45]) {
        assert.ok(
          Math.hypot(x - postX, z - postZ) >= bodyRadius + 0.11,
          `avatar intersects a corner post at progress ${p}`,
        );
      }
    }
  }
});

test("the entry lifts feet clear of risers before advancing onto each tread", () => {
  // A 0.4m foot footprint is narrower than the physical 0.5m treads. Body
  // clearance is checked separately because a torso capsule is not a shoe.
  const footHalfLength = 0.2;
  let last = entryPosition(ENTRY.start);
  for (let n = 0; n <= 4000; n++) {
    const p = ENTRY.start + (ENTRY.end - ENTRY.start) * n / 4000;
    const [x, y, z] = entryPosition(p);
    let support = 0;
    for (let tread = 0; tread < 5; tread++) {
      const centre = -5.4 + tread * 0.5;
      if (x + footHalfLength > centre - 0.25 + 1e-9 && x - footHalfLength < centre + 0.25 - 1e-9) {
        support = Math.max(support, 1.27 * (tread + 1) / 5);
      }
    }
    if (x + footHalfLength > -3.5) support = Math.max(support, 1.2);
    if (x + footHalfLength > -3.4) support = Math.max(support, 1.27);
    assert.ok(y >= support - 1e-9, `feet penetrate a solid riser at progress ${p}`);
    assert.ok(y - support <= 1.27 / 5 + 1e-9, "root rises by more than a single step");
    assert.equal(z, ENTRY.z, "entry must stay centred in the rope opening");
    assert.ok(x >= last[0] - 1e-9 && y >= last[1] - 1e-9, "entry doubles back");
    last = [x, y, z];
  }
});

test("entry pose metadata pairs stable foot supports and reconstructs the continuous root", () => {
  const supports = new Map();
  let previous;
  for (let n = 0; n <= 6000; n++) {
    const p = n === 6000 ? ENTRY.end : ENTRY.start + (ENTRY.end - ENTRY.start) * n / 6000;
    const sample = sampleJourney(p);
    const pose = sample.entryPose;
    assert.ok(pose, "entry is missing its grounded-pose contract");
    assert.ok(Number.isInteger(pose.stepIndex) && pose.stepIndex >= 0 && pose.stepIndex <= ENTRY.steps);
    assert.ok(pose.progress >= 0 && pose.progress <= 1, "segment progress must be eased and bounded");
    const interpolate = (axis) => pose.from[axis] + (pose.to[axis] - pose.from[axis]) * pose.progress;
    const reconstructed = pose.phase === "rope" ? entryPosition(p) : pose.phase === "lift"
      ? [pose.from[0], interpolate(1), pose.from[2]]
      : pose.phase === "advance"
        ? [interpolate(0), pose.to[1], interpolate(2)]
        : [interpolate(0), interpolate(1), interpolate(2)];
    assert.ok(length(reconstructed, sample.avatar) < 1e-9, "IK metadata disagrees with the rendered root");

    const support = { from: pose.from, to: pose.to };
    if (supports.has(pose.stepIndex)) {
      assert.deepEqual(support, supports.get(pose.stepIndex), "a lift and advance must share foot targets");
    } else {
      supports.set(pose.stepIndex, support);
      if (previous) assert.deepEqual(pose.from, previous.to, "next step loses the previous landing support");
    }
    if (previous?.stepIndex === pose.stepIndex && previous.phase === pose.phase) {
      assert.ok(pose.progress >= previous.progress, "pose progress reverses inside a segment");
    }
    if (previous) assert.ok(length(sample.avatar, previous.avatar) < 0.004, "pose handoff jumps");
    previous = { ...pose, avatar: sample.avatar };
  }
  assert.equal(supports.size, ENTRY.steps + 1, "every stair and the apron-to-ring segment need targets");
  assert.equal(previous.phase, "rope");
  assert.equal(previous.progress, 1);
  assert.ok(length(previous.from, [-3.6, ENTRY.rise, ENTRY.z]) < 1e-9);
  assert.deepEqual(previous.to, [-2.5, ENTRY.rise, ENTRY.z]);
  assert.equal(sampleJourney(ENTRY.start - 1e-6).entryPose, null);
  assert.equal(sampleJourney(ENTRY.end + 1e-6).entryPose, null);
});

test("entry pose supports cannot mutate later forward or reverse samples", () => {
  const p = ENTRY.start + (ENTRY.end - ENTRY.start) * 0.4;
  const expected = sampleJourney(p);
  const changed = sampleJourney(p);
  changed.entryPose.from[0] = 999;
  changed.entryPose.to[1] = -999;
  sampleJourney(ENTRY.end);
  assert.deepEqual(sampleJourney(p), expected);
});

test("progress clamps invalid and out-of-range input without exposing NaN transforms", () => {
  assert.deepEqual(sampleJourney(-1), sampleJourney(0));
  assert.deepEqual(sampleJourney(NaN), sampleJourney(0));
  assert.deepEqual(sampleJourney(2), sampleJourney(1));
});
