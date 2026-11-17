import test from 'node:test';
import assert from 'node:assert/strict';
import { REGIONS, solidAt, distance } from '../game/src/regions.js';

test('charted sheltered routes clear islands and fixed reefs', () => {
  for (const region of REGIONS) {
    for (let i = 1; i < region.safeRoute.length; i++) {
      const a = region.safeRoute[i - 1], b = region.safeRoute[i];
      for (let t = 0; t <= 1; t += .02) {
        const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        assert.equal(solidAt(p.x, p.y, region, 18), false, `${region.name} island at ${p.x},${p.y}`);
        assert.ok(region.reefs.every(reef => distance(p, reef) > reef.r + 22), `${region.name} reef at ${p.x},${p.y}`);
      }
    }
  }
});
