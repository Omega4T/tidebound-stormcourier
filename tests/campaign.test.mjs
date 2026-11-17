import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoyage, startVoyage, interact, chooseDock, tick } from '../game/src/campaign.js';
import { REGIONS } from '../game/src/regions.js';
import { updateSailing } from '../game/src/sailing.js';

function markChannel(state) {
  for (const buoy of REGIONS[state.region].buoys) {
    Object.assign(state.boat, buoy, { vx: 0, vy: 0 });
    updateSailing(state, {}, 1 / 60);
  }
}

test('three real dock deliveries consume cargo and complete the campaign', () => {
  const state = createVoyage();
  startVoyage(state);
  for (let region = 0; region < 3; region++) {
    markChannel(state);
    Object.assign(state.boat, REGIONS[region].dock, { vx: 0, vy: 0 });
    interact(state);
    assert.equal(state.beacons, region + 1);
    assert.equal(state.cargo, 2 - region);
    if (region < 2) {
      assert.equal(state.phase, 'dock');
      chooseDock(state, 'depart');
      assert.equal(state.region, region + 1);
      assert.equal(state.phase, 'sailing');
    }
  }
  assert.equal(state.phase, 'won');
  assert.equal(state.delivered, 3);
});

test('clock failure is bounded and dock upgrades are real resource tradeoffs', () => {
  const state = createVoyage();
  startVoyage(state);
  tick(state, 211);
  assert.equal(state.phase, 'lost');
  assert.match(state.reason, /storm/i);
  startVoyage(state);
  assert.equal(interact(state), false);
  markChannel(state);
  Object.assign(state.boat, REGIONS[0].dock);
  interact(state);
  state.hull = 35;
  const before = state.scrap;
  assert.equal(chooseDock(state, 'repair'), true);
  assert.equal(state.scrap, before - 3);
  assert.equal(state.hull, 80);
  assert.equal(chooseDock(state, 'armor'), false);
  assert.equal(state.armor, false);
  assert.equal(chooseDock(state, 'canvas'), false);
  assert.equal(state.canvas, false);
  chooseDock(state, 'route');
  assert.equal(state.route, 'express');
  chooseDock(state, 'depart');
  assert.equal(state.route, 'express');
});

test('a new voyage begins at the title with three unlit beacons and usable supplies', () => {
  const state = createVoyage();
  assert.equal(state.phase, 'title');
  assert.equal(state.beacons, 0);
  assert.equal(state.hull, 100);
  assert.equal(state.cargo, 3);
  assert.equal(state.region, 0);
  assert.ok(state.timeLeft >= 150 && state.timeLeft <= 240);
});
