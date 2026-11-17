import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoyage, startVoyage, interact, chooseDock } from '../game/src/campaign.js';
import { REGIONS } from '../game/src/regions.js';
import { updateSailing, damageHull } from '../game/src/sailing.js';

function lightChannel(state) {
  for (const buoy of REGIONS[state.region].buoys) {
    Object.assign(state.boat, buoy, { vx: 0, vy: 0 });
    updateSailing(state, {}, 1 / 60);
  }
}

test('a beacon delivery requires the actual channel signals first', () => {
  const state = createVoyage(); startVoyage(state);
  Object.assign(state.boat, REGIONS[0].dock);
  assert.equal(interact(state), false);
  assert.equal(state.beacons, 0);
  lightChannel(state);
  assert.equal(state.signals.length, 2);
  Object.assign(state.boat, REGIONS[0].dock);
  assert.equal(interact(state), true);
  chooseDock(state, 'depart');
  assert.deepEqual(state.signals, []);
});

test('express passage exchanges greater damage for speed and a delivery premium', () => {
  const normal = createVoyage(); startVoyage(normal);
  const express = createVoyage(); startVoyage(express); express.route = 'express';
  updateSailing(normal, { right: true }, .2);
  updateSailing(express, { right: true }, .2);
  assert.ok(express.boat.vx > normal.boat.vx);
  damageHull(normal, 20, 'TEST'); damageHull(express, 20, 'TEST');
  assert.ok(express.hull < normal.hull);
  lightChannel(express); const money = express.scrap;
  Object.assign(express.boat, REGIONS[0].dock);
  interact(express);
  assert.equal(express.scrap, money + 5);
});

test('a signal can be lit once and a new voyage resets its state', () => {
  const state = createVoyage(); startVoyage(state);
  Object.assign(state.boat, REGIONS[0].buoys[0]);
  updateSailing(state, {}, 1 / 60);
  const score = state.score;
  updateSailing(state, {}, 1 / 60);
  assert.equal(state.signals.length, 1);
  assert.equal(state.score, score);
  startVoyage(state);
  assert.deepEqual(state.signals, []);
});
