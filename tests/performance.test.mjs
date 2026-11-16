import test from 'node:test';
import assert from 'node:assert/strict';
import { initialQuality, nextQuality, QUALITY } from '../lib/arena/performance.mjs';
import { scrollToJourney, journeyToScroll, deskSectionAt, deskSectionProgress, DESK_SECTIONS } from '../lib/arena/deskScroll.mjs';

test('small screens, constrained hardware and data saver avoid extra render passes', () => {
  for (const device of [{mobile:true,cores:16,memory:16}, {cores:4,memory:16}, {cores:16,memory:4}, {cores:16,memory:16,saveData:true}, {}]) {
    const budget = QUALITY[initialQuality(device)];
    assert.equal(budget.effects, false);
    assert.equal(budget.shadows, false);
    assert.ok(budget.dpr <= 1);
    assert.ok(budget.crowd <= 500);
  }
});
test('sustained slow frames reduce cost without quality oscillation', () => {
  let tier = initialQuality({cores:16,memory:16});
  for (const ms of [42,18,44,17,80,90]) {
    const next = nextQuality(tier,ms);
    assert.ok(next <= tier && next >= 0);
    tier = next;
  }
  assert.equal(tier, 0);
});
test('scroll remapping remains continuous, reversible and reaches all desk sections', () => {
  let previous = -1;
  for (let i=0;i<=2000;i++) {
    const p=i/2000, mapped=scrollToJourney(p);
    assert.ok(mapped >= previous);
    assert.ok(Math.abs(journeyToScroll(mapped)-p)<1e-10);
    previous=mapped;
  }
  for (const section of DESK_SECTIONS) assert.equal(deskSectionAt(deskSectionProgress(section)),section);
});
