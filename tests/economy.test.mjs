import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoyage, startVoyage, interact, chooseDock } from '../game/src/campaign.js';
import { REGIONS } from '../game/src/regions.js';
import { updateSailing } from '../game/src/sailing.js';

test('one early salvage and a delivery fund one permanent upgrade, not both', () => {
  const state = createVoyage(); startVoyage(state);
  Object.assign(state.boat, REGIONS[0].salvage[0]);
  updateSailing(state, {}, 1 / 60);
  for (const buoy of REGIONS[0].buoys) {
    Object.assign(state.boat, buoy); updateSailing(state, {}, 1 / 60);
  }
  Object.assign(state.boat, REGIONS[0].dock); interact(state);
  assert.equal(state.scrap, 7);
  assert.equal(chooseDock(state, 'armor'), true);
  assert.equal(chooseDock(state, 'canvas'), false);
  assert.equal(state.scrap, 3);
});
