import { REGIONS, distance } from './regions.js';

// Campaign state has no browser dependencies. The renderer only observes it.
export function createVoyage() {
  return {
    phase: 'title', region: 0, beacons: 0, hull: 100, cargo: 3,
    timeLeft: 210, elapsed: 0, scrap: 4, recovered: 0, delivered: 0,
    armor: false, canvas: false, route: 'shelter', score: 0,
    reason: '', events: [], message: '', messageTime: 0,
    boat: { x: 152, y: 548, vx: 0, vy: 0, angle: -0.5, invulnerable: 0, stamina: 100 },
    particles: [], wake: [], taken: [], lightning: [], nextStrike: 5,
  };
}

export function announce(state, message, event = 'notice') {
  state.message = message;
  state.messageTime = 5;
  state.events.push(event);
}

export function startVoyage(state) {
  Object.assign(state, createVoyage(), { phase: 'sailing' });
  announce(state, 'Three dark beacons. One small boat. Sail for Morrow Light.', 'start');
}

export function interact(state) {
  if (state.phase !== 'sailing') return false;
  const region = REGIONS[state.region];
  if (distance(state.boat, region.dock) > 76) {
    announce(state, 'Sail into the gold dock ring, then press E to deliver.');
    return false;
  }
  state.beacons++;
  state.delivered++;
  state.cargo--;
  state.scrap += 3;
  state.boat.vx = 0;
  state.boat.vy = 0;
  state.score += 1000;
  state.phase = state.beacons === 3 ? 'won' : 'dock';
  announce(state, `${region.beacon} relit. The coast has a way home.`, 'beacon');
  return true;
}

export function chooseDock(state, choice) {
  if (state.phase !== 'dock') return false;
  if (choice === 'depart') {
    state.region++;
    state.taken = [];
    state.lightning = [];
    state.nextStrike = state.elapsed + 4;
    Object.assign(state.boat, REGIONS[state.region].spawn, { vx: 0, vy: 0, stamina: 100 });
    state.phase = 'sailing';
    announce(state, REGIONS[state.region].warning, 'depart');
    return true;
  }
  if (choice === 'route') {
    state.route = state.route === 'shelter' ? 'express' : 'shelter';
    return true;
  }
  const upgrades = {
    repair: { cost: 3, allowed: state.hull < 100 },
    armor: { cost: 4, allowed: !state.armor },
    canvas: { cost: 4, allowed: !state.canvas },
  };
  const upgrade = upgrades[choice];
  if (!upgrade || !upgrade.allowed || state.scrap < upgrade.cost) return false;
  state.scrap -= upgrade.cost;
  if (choice === 'repair') state.hull = Math.min(100, state.hull + 45);
  else state[choice] = true;
  announce(state, choice === 'repair' ? 'Hull patched +45. Ready for rougher water.' : `${choice === 'armor' ? 'Copper hull' : 'Storm canvas'} fitted.`, 'upgrade');
  return true;
}

export function tick(state, dt) {
  if (state.phase !== 'sailing') return;
  state.elapsed += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  state.messageTime = Math.max(0, state.messageTime - dt);
  if (state.timeLeft <= 0) {
    state.phase = 'lost';
    state.reason = 'The storm closed the shipping lanes.';
    state.events.push('loss');
  }
}
