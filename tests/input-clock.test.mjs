import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoyage, startVoyage, tick, interact, chooseDock } from '../game/src/campaign.js';
import { REGIONS } from '../game/src/regions.js';
import { updateSailing } from '../game/src/sailing.js';

test('dock reward remains the actual last delivery payment after changing route', () => {
  const state = createVoyage(); startVoyage(state);
  for (const point of REGIONS[0].buoys) {
    Object.assign(state.boat, point); updateSailing(state, {}, 1 / 60);
  }
  Object.assign(state.boat, REGIONS[0].dock);
  interact(state);
  assert.equal(state.lastPayment, 3);
  chooseDock(state, 'route');
  assert.equal(state.route, 'express');
  assert.equal(state.lastPayment, 3);
});

test('docking and terminal states freeze the storm clock', () => {
  for (const phase of ['title', 'dock', 'won', 'lost']) {
    const state = createVoyage(); state.phase = phase;
    tick(state, 30);
    assert.equal(state.timeLeft, 150);
  }
});

test('the final frame of a storm loss never moves the boat afterward', () => {
  const state = createVoyage(); startVoyage(state);
  state.timeLeft = .001;
  const { x, y } = state.boat;
  updateSailing(state, { right: true }, .02);
  assert.equal(state.phase, 'lost');
  assert.equal(state.boat.x, x); assert.equal(state.boat.y, y);
});
