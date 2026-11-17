import test from 'node:test';
import assert from 'node:assert/strict';
import { createVoyage } from '../game/src/campaign.js';
import { dockScreen, resultScreen, pauseScreen } from '../game/src/screens.js';

test('dock explains actual delivery payment and the next route tradeoff', () => {
  const state = createVoyage(); state.phase = 'dock'; state.beacons = 1;
  state.lastPayment = 3; state.route = 'express';
  const screen = dockScreen(state);
  assert.match(screen, /Harbor paid \+3 scrap/);
  assert.match(screen, /25% faster/);
  assert.match(screen, /30% more damage/);
  assert.match(screen, /DEPART FOR THE GLASS NARROWS/);
});

test('both terminal screens expose an ordinary restart and distinct outcomes', () => {
  const state = createVoyage(); state.phase = 'won'; state.beacons = 3;
  assert.match(resultScreen(state, 100), /THE COAST IS HOME/);
  state.phase = 'lost'; state.reason = 'Your hull broke in the storm.';
  assert.match(resultScreen(state, 100), /VOYAGE LOST/);
  assert.match(resultScreen(state, 100), /data-action="restart"/);
  assert.match(pauseScreen(), /data-action="resume"/);
});
