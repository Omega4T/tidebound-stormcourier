import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoyage, startVoyage } from '../game/src/campaign.js';
import { updateSailing } from '../game/src/sailing.js';

function sail(seconds, input = {}) {
  const state = createVoyage();
  startVoyage(state);
  for (let i = 0; i < seconds * 60; i++) updateSailing(state, input, 1 / 60);
  return state;
}

test('directional steering moves immediately and full sail is faster but spends stamina', () => {
  const normal = sail(1, { right: true });
  const fast = sail(1, { right: true, boost: true });
  assert.ok(normal.boat.x > 190);
  assert.ok(fast.boat.x > normal.boat.x + 15);
  assert.ok(fast.boat.stamina < normal.boat.stamina);
});

test('rock impacts cost hull and invulnerability prevents frame-rate damage', () => {
  const state = createVoyage(); startVoyage(state);
  Object.assign(state.boat, { x: 516, y: 440, vx: 90 });
  updateSailing(state, { right: true }, 1 / 60);
  const damaged = state.hull;
  assert.ok(damaged < 100);
  updateSailing(state, { right: true }, 1 / 60);
  assert.equal(state.hull, damaged);
});

test('salvage is collected once and a ruined hull causes a genuine failure', () => {
  const state = createVoyage(); startVoyage(state);
  Object.assign(state.boat, { x: 288, y: 483 });
  updateSailing(state, {}, 1 / 60);
  assert.equal(state.recovered, 1);
  assert.equal(state.scrap, 4);
  updateSailing(state, {}, 1 / 60);
  assert.equal(state.recovered, 1);
  state.hull = 1;
  Object.assign(state.boat, { x: 520, y: 440, invulnerable: 0 });
  updateSailing(state, {}, 1 / 60);
  assert.equal(state.phase, 'lost');
  assert.match(state.reason, /hull/i);
});

test('an idle voyage fails within its published 150 seconds', () => {
  const state = sail(151);
  assert.equal(state.phase, 'lost');
});
