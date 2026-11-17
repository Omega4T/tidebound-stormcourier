import { REGIONS, distance, solidAt, driftwood } from './regions.js';
import { tick, announce } from './campaign.js';

export function damageHull(state, amount, cause) {
  const boat = state.boat;
  if (boat.invulnerable > 0 || state.phase !== 'sailing') return;
  const damage = Math.round(amount * (state.armor ? 0.58 : 1));
  state.hull = Math.max(0, state.hull - damage);
  boat.invulnerable = 1.15;
  state.shake = 12;
  announce(state, `${cause} −${damage} HULL · Slow down near hazards.`, 'impact');
  if (state.hull === 0) {
    state.phase = 'lost';
    state.reason = 'Your hull broke in the storm.';
    state.events.push('loss');
  }
}

export function updateSailing(state, input, dt) {
  if (state.phase !== 'sailing') return;
  tick(state, dt);
  if (state.phase !== 'sailing') return;
  const boat = state.boat;
  const region = REGIONS[state.region];
  boat.invulnerable = Math.max(0, boat.invulnerable - dt);
  state.shake = Math.max(0, (state.shake || 0) - dt * 30);
  let dx = Number(!!input.right) - Number(!!input.left);
  let dy = Number(!!input.down) - Number(!!input.up);
  const length = Math.hypot(dx, dy);
  if (length) { dx /= length; dy /= length; }
  const fullSail = !!input.boost && boat.stamina > 4 && length > 0;
  boat.fullSail = fullSail;
  boat.stamina = Math.max(0, Math.min(100, boat.stamina + dt * (fullSail ? -26 : 19)));
  const speed = (fullSail ? 226 : 142) * (state.canvas ? 1.18 : 1);
  const response = 1 - Math.exp(-dt * (fullSail ? 3.1 : 7.5));
  const inTide = state.region > 0 && boat.x > 350 && boat.x < 680;
  const tide = inTide ? region.current * (state.route === 'express' ? 1.6 : 1) : 0;
  boat.vx += (dx * speed + tide + (length ? region.wind.x : 0) - boat.vx) * response;
  boat.vy += (dy * speed + (length ? region.wind.y : 0) - boat.vy) * response;
  const oldX = boat.x, oldY = boat.y;
  boat.x = Math.max(28, Math.min(1252, boat.x + boat.vx * dt));
  boat.y = Math.max(134, Math.min(638, boat.y + boat.vy * dt));
  if (length) {
    const desired = Math.atan2(dy, dx);
    const delta = Math.atan2(Math.sin(desired - boat.angle), Math.cos(desired - boat.angle));
    boat.angle += delta * Math.min(1, dt * 11);
  }
  if (solidAt(boat.x, boat.y, region, 8)) {
    boat.x = oldX; boat.y = oldY;
    boat.vx *= -0.35; boat.vy *= -0.35;
    damageHull(state, fullSail ? 24 : 13, 'SHORE IMPACT');
  }
  for (const rock of [...region.reefs, ...driftwood(state.region, state.elapsed)]) {
    const d = distance(boat, rock);
    if (d < rock.r + 13) {
      damageHull(state, fullSail ? 28 : 16, 'REEF / WRECK');
      const angle = Math.atan2(boat.y - rock.y || 1, boat.x - rock.x || 1);
      boat.x = rock.x + Math.cos(angle) * (rock.r + 15);
      boat.y = rock.y + Math.sin(angle) * (rock.r + 15);
      boat.vx *= 0.3; boat.vy *= 0.3;
    }
  }
  region.salvage.forEach((crate, index) => {
    if (!state.taken.includes(index) && distance(boat, crate) < 34) {
      state.taken.push(index);
      state.scrap += 2; state.recovered++; state.score += 150;
      announce(state, '+2 SCRAP · Salvage recovered. Spend it at the next light.', 'salvage');
    }
  });
  if (state.region === 2) updateLightning(state, dt);
  if (Math.hypot(boat.vx, boat.vy) > 22) {
    state.wake.push({ x: boat.x, y: boat.y, age: 0, angle: boat.angle });
  }
  for (const point of state.wake) point.age += dt;
  state.wake = state.wake.filter(point => point.age < 1.3).slice(-90);
}

export function updateLightning(state, dt) {
  if (state.elapsed >= state.nextStrike) {
    state.lightning.push({ x: state.boat.x + state.boat.vx * 0.45, y: state.boat.y + state.boat.vy * 0.45, age: 0 });
    state.nextStrike = state.elapsed + (state.route === 'express' ? 2.7 : 4.2);
    state.events.push('warning');
  }
  for (const strike of state.lightning) {
    strike.age += dt;
    if (strike.age >= 1.8 && !strike.hit) {
      strike.hit = true;
      state.events.push('thunder');
      if (distance(state.boat, strike) < 62) damageHull(state, 26, 'LIGHTNING');
    }
  }
  state.lightning = state.lightning.filter(strike => strike.age < 2.25);
}
