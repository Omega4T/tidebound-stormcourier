// Original procedural coastal art: no image assets, fonts, or runtime downloads.
import { REGIONS, driftwood } from './regions.js';
const GOLD = '#f2cb82';

export function polygon(ctx, points, fill, stroke) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}

export function drawSea(ctx, region, time) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 720);
  gradient.addColorStop(0, region.sea[0]); gradient.addColorStop(1, region.sea[1]);
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1280, 720);
  // Hand-placed frequency bands create broken horizontal paint strokes.
  for (let y = 115; y < 700; y += 17) {
    for (let x = -50; x < 1320; x += 63) {
      const n = Math.sin(x * 1.72 + y * 0.31);
      const offset = Math.sin(time * 0.65 + y * 0.04) * 9;
      ctx.globalAlpha = 0.045 + (n + 1) * 0.019;
      ctx.fillStyle = n > 0.3 ? '#bee1d2' : '#020e24';
      ctx.fillRect(x + n * 24 + offset, y + Math.sin(x + time) * 3, 19 + n * 13, 2);
    }
  }
  ctx.globalAlpha = 1;
  // Distant mist and glints remain deliberately low contrast around gameplay.
  for (let i = 0; i < 7; i++) {
    const x = (i * 227 + time * 5) % 1530 - 120;
    ellipse(ctx, x, 140 + (i % 3) * 176, 155, 20, '#d7ddd208');
  }
}

function islandOutline(island, scale = 1, shiftY = 0) {
  const points = [];
  for (let i = 0; i < 36; i++) {
    const angle = i / 36 * Math.PI * 2;
    const rough = 1 + Math.sin(i * 2.3 + island.x) * 0.045;
    points.push([island.x + Math.cos(angle) * island.rx * rough * scale,
      island.y + Math.sin(angle) * island.ry * rough * scale + shiftY]);
  }
  return points;
}

export function drawIsland(ctx, island, region, time, lit) {
  polygon(ctx, islandOutline(island, 1.17), '#70ab9a0d');
  polygon(ctx, islandOutline(island, 1.10), '#5c99884b');
  ctx.lineWidth = 2;
  polygon(ctx, islandOutline(island, 1.05), '#213f45', '#83aca35a');
  polygon(ctx, islandOutline(island, 1, 8), '#283d44');
  polygon(ctx, islandOutline(island), '#afaa87');
  polygon(ctx, islandOutline(island, 0.93, -3), region.land);
  polygon(ctx, islandOutline(island, 0.78, -7), region.grass);
  // Terrace lines, sandy footpaths, and fine coast detail.
  ctx.strokeStyle = '#d8c59450'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(island.x - island.rx * 0.5, island.y + 15);
  ctx.quadraticCurveTo(island.x, island.y - 20, island.x + island.rx * 0.6, island.y + 6); ctx.stroke();
  for (let i = 0; i < 27; i++) {
    const a = i * 2.4;
    const r = ((i * 23) % 71) / 100;
    const x = island.x + Math.cos(a) * island.rx * r;
    const y = island.y + Math.sin(a) * island.ry * r - 8;
    if (island.light && x > island.x - 35) continue;
    if (i % 4 === 0) {
      ellipse(ctx, x + 2, y + 7, 9, 3, '#233b4655');
      polygon(ctx, [[x, y - 18], [x - 7, y + 4], [x + 7, y + 4]], '#345a51');
      polygon(ctx, [[x - 1, y - 13], [x - 4, y + 2], [x + 2, y + 2]], '#54775d');
      ctx.fillStyle = '#4b5144'; ctx.fillRect(x - 1, y + 3, 2, 5);
    } else {
      ctx.fillStyle = i % 2 ? '#263f413c' : '#a0b28b60';
      ctx.fillRect(x, y, 4 + i % 5, 2);
    }
  }
  if (island.village) {
    for (let i = 0; i < (island.light ? 3 : 4); i++) {
      const x = island.x - 48 + i * 21, y = island.y + 4 + Math.sin(i * 2) * 12;
      drawHouse(ctx, x, y, i);
    }
  }
  if (island.light) drawLighthouse(ctx, island.x + 23, island.y - 16, time, lit);
}

function drawHouse(ctx, x, y, index) {
  ellipse(ctx, x + 3, y + 12, 13, 5, '#183a3a55');
  ctx.fillStyle = index % 2 ? '#b0b6a2' : '#c8b99b'; ctx.fillRect(x - 8, y - 3, 16, 14);
  ctx.fillStyle = '#807e73'; ctx.fillRect(x + 5, y - 3, 4, 14);
  polygon(ctx, [[x - 12, y - 3], [x - 1, y - 13], [x + 11, y - 3]], index % 2 ? '#815c52' : '#574f59');
  ctx.fillStyle = '#ffe3a0'; ctx.fillRect(x - 5, y + 1, 4, 5);
  ctx.fillStyle = '#455450'; ctx.fillRect(x + 3, y + 5, 3, 6);
}

function drawLighthouse(ctx, x, y, time, lit) {
  if (lit) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const direction = Math.sin(time * 0.24) * 0.35 + 2.25;
    const length = 540;
    const gradient = ctx.createRadialGradient(x, y - 66, 5, x, y - 66, length);
    gradient.addColorStop(0, '#ffeac663'); gradient.addColorStop(1, '#ffeac600');
    polygon(ctx, [[x, y - 66], [x + Math.cos(direction - 0.17) * length, y - 66 + Math.sin(direction - 0.17) * length],
      [x + Math.cos(direction + 0.17) * length, y - 66 + Math.sin(direction + 0.17) * length]], gradient);
    ctx.restore();
  }
  ellipse(ctx, x + 10, y + 13, 26, 9, '#19333d66');
  polygon(ctx, [[x - 13, y + 7], [x - 8, y - 55], [x + 8, y - 55], [x + 14, y + 7]], '#ece1bc');
  polygon(ctx, [[x + 3, y + 7], [x + 3, y - 55], [x + 8, y - 55], [x + 14, y + 7]], '#a9b4a7');
  ctx.fillStyle = '#626c70'; ctx.fillRect(x - 10, y - 40, 20, 9);
  ctx.fillStyle = '#263c4a'; ctx.fillRect(x - 11, y - 66, 22, 13);
  ctx.fillStyle = lit ? '#ffe4a0' : '#879d9b'; ctx.fillRect(x - 7, y - 64, 14, 9);
  polygon(ctx, [[x - 15, y - 67], [x, y - 79], [x + 15, y - 67]], '#9e6357');
  ctx.fillStyle = '#334e53'; ctx.fillRect(x - 3, y - 7, 6, 14);
  if (lit) {
    const glow = ctx.createRadialGradient(x, y - 60, 2, x, y - 60, 45);
    glow.addColorStop(0, '#fff2b577'); glow.addColorStop(1, '#fff2b500');
    ctx.fillStyle = glow; ctx.fillRect(x - 45, y - 105, 90, 90);
  }
}

export function drawReef(ctx, reef, time) {
  ellipse(ctx, reef.x, reef.y + 5, reef.r + 13, reef.r * 0.6 + 7, '#80b1a51c');
  ctx.lineWidth = 1; ctx.strokeStyle = '#a3c4b36a';
  ctx.beginPath(); ctx.ellipse(reef.x, reef.y + 4, reef.r + 9 + Math.sin(time * 2) * 2, reef.r * 0.6 + 4, 0, 0, Math.PI * 1.8); ctx.stroke();
  polygon(ctx, [[reef.x - reef.r, reef.y + 5], [reef.x - reef.r * 0.5, reef.y - 10], [reef.x + 4, reef.y - reef.r],
    [reef.x + reef.r, reef.y + 3], [reef.x + 3, reef.y + 12]], '#48636c', '#1c3747');
  polygon(ctx, [[reef.x - reef.r * 0.5, reef.y - 10], [reef.x + 4, reef.y - reef.r], [reef.x + 1, reef.y + 3]], '#8b9991');
}

export function drawBoat(ctx, boat, time, ghost = false) {
  ctx.save(); ctx.translate(boat.x, boat.y);
  ctx.rotate(boat.angle + Math.PI / 2);
  if (ghost) ctx.globalAlpha = 0.7;
  if (boat.invulnerable > 0 && Math.floor(time * 16) % 2 === 0) ctx.globalAlpha = 0.5;
  ellipse(ctx, 5, 11, 13, 22, '#061d3066');
  polygon(ctx, [[0, -27], [-12, -9], [-10, 20], [0, 25], [10, 20], [12, -9]], '#4c2f32', '#f2cb82');
  polygon(ctx, [[0, -22], [-8, -7], [-7, 17], [7, 17], [8, -7]], '#b16f4d');
  ctx.strokeStyle = '#e6b078'; ctx.lineWidth = 2;
  for (let y = -4; y < 18; y += 6) { ctx.beginPath(); ctx.moveTo(-7, y); ctx.lineTo(7, y); ctx.stroke(); }
  ctx.fillStyle = '#283947'; ctx.fillRect(-5, 5, 10, 9);
  ctx.fillStyle = '#e9c68b'; ctx.fillRect(-4, 4, 8, 3);
  ctx.strokeStyle = '#3f3839'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 11); ctx.lineTo(0, -30); ctx.stroke();
  const billow = Math.sin(time * 4) * 2;
  polygon(ctx, [[-1, -26], [-1, 6], [-20 - billow, -1]], boat.fullSail ? '#ffe8ac' : '#e5d5b2');
  polygon(ctx, [[2, -21], [2, 6], [16 + billow, 2]], '#b4c8bd');
  ctx.fillStyle = GOLD; ctx.fillRect(-3, -30, 3, 4);
  ctx.restore();
}

export function drawWorld(ctx, state, time) {
  const region = REGIONS[state.region];
  drawSea(ctx, region, time);
  if (state.region > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(345, 130, 340, 510); ctx.clip();
    for (let i = 0; i < 24; i++) {
      const x = 345 + (time * 43 + i * 71) % 340;
      const y = 145 + i * 22;
      ctx.strokeStyle = '#a9e4d028'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 25, y); ctx.lineTo(x, y); ctx.lineTo(x - 5, y - 3); ctx.stroke();
    }
    ctx.restore();
  }
  region.islands.forEach(island => drawIsland(ctx, island, region, time, island.light && state.beacons > state.region));
  region.reefs.forEach(reef => drawReef(ctx, reef, time));
  region.buoys.forEach((buoy, i) => {
    const lit = state.signals.includes(i);
    ctx.strokeStyle = lit ? '#9bd7bd' : '#f2cb82';
    ctx.lineWidth = 2; ctx.setLineDash(lit ? [] : [6, 5]);
    ctx.beginPath(); ctx.arc(buoy.x, buoy.y, 35 + Math.sin(time * 2) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = lit ? '#b4f0ca' : '#ffe1a2';
    ctx.fillText(lit ? 'SIGNAL LIT' : `SIGNAL ${i + 1}`, buoy.x, buoy.y - 45);
    ellipse(ctx, buoy.x, buoy.y + 6, 8, 3, '#d9e2c74d');
    ctx.fillStyle = i ? '#e3c99c' : '#c68566';
    ctx.fillRect(buoy.x - 3, buoy.y - 6 + Math.sin(time * 2), 6, 10);
    ctx.fillStyle = GOLD; ctx.fillRect(buoy.x - 1, buoy.y - 9 + Math.sin(time * 2), 2, 3);
  });
  region.salvage.forEach((crate, index) => {
    if (state.taken.includes(index)) return;
    const y = crate.y + Math.sin(time * 2 + index) * 2;
    const glow = ctx.createRadialGradient(crate.x, y, 0, crate.x, y, 28);
    glow.addColorStop(0, '#edcd7940'); glow.addColorStop(1, '#edcd7900');
    ctx.fillStyle = glow; ctx.fillRect(crate.x - 28, y - 28, 56, 56);
    ctx.fillStyle = '#b99059'; ctx.fillRect(crate.x - 8, y - 7, 16, 14);
    ctx.strokeStyle = '#f3d396'; ctx.lineWidth = 1; ctx.strokeRect(crate.x - 8, y - 7, 16, 14);
    ctx.beginPath(); ctx.moveTo(crate.x - 7, y - 6); ctx.lineTo(crate.x + 7, y + 6); ctx.moveTo(crate.x + 7, y - 6); ctx.lineTo(crate.x - 7, y + 6); ctx.stroke();
  });
  driftwood(state.region, state.elapsed).forEach(wreck => {
    ctx.save(); ctx.translate(wreck.x, wreck.y); ctx.rotate(Math.sin(time * 0.3) * 0.3);
    ctx.fillStyle = '#665547'; ctx.fillRect(-22, -6, 44, 12);
    ctx.strokeStyle = '#baa780'; ctx.strokeRect(-22, -6, 44, 12);
    ctx.fillStyle = '#333e41'; ctx.fillRect(-12, -8, 4, 16); ctx.fillRect(10, -8, 4, 16); ctx.restore();
  });
  drawDock(ctx, state, time);
  for (const point of state.wake) {
    ctx.save(); ctx.translate(point.x, point.y); ctx.rotate(point.angle);
    ctx.strokeStyle = `rgba(178,221,209,${(1 - point.age / 1.3) * 0.16})`;
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-point.age * 23, -9 - point.age * 9);
    ctx.lineTo(-point.age * 28 - 7, 0); ctx.lineTo(-point.age * 23, 9 + point.age * 9); ctx.stroke(); ctx.restore();
  }
  drawBoat(ctx, state.boat, time);
  state.lightning.forEach(strike => drawLightning(ctx, strike, time));
  if (state.region === 2) drawRain(ctx, time);
  const vignette = ctx.createRadialGradient(640, 360, 230, 640, 360, 760);
  vignette.addColorStop(0, '#05121c00'); vignette.addColorStop(1, '#05121c88');
  ctx.fillStyle = vignette; ctx.fillRect(0, 108, 1280, 550);
}

function drawDock(ctx, state, time) {
  const dock = REGIONS[state.region].dock;
  ctx.fillStyle = '#74674f'; ctx.fillRect(dock.x + 6, dock.y - 44, 44, 12);
  ctx.fillStyle = '#c6ad7e';
  for (let i = 0; i < 6; i++) ctx.fillRect(dock.x + 9 + i * 6, dock.y - 44, 3, 12);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
  ctx.setLineDash([5, 6]); ctx.lineDashOffset = -time * 10;
  ctx.beginPath(); ctx.ellipse(dock.x, dock.y, 48 + Math.sin(time * 2) * 3, 29, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'center'; ctx.font = '600 13px system-ui';
  ctx.fillStyle = '#071f30dd'; ctx.fillRect(dock.x - 83, dock.y + 41, 166, 45);
  ctx.fillStyle = GOLD; ctx.fillText(REGIONS[state.region].beacon.toUpperCase(), dock.x, dock.y + 59);
  ctx.fillStyle = '#d7e4dc'; ctx.font = '12px system-ui'; ctx.fillText(state.signals.length === 2 ? 'CHANNEL CLEAR · E TO DELIVER' : `SIGNALS ${state.signals.length}/2 · MARK THE CHANNEL`, dock.x, dock.y + 77);
}

function drawLightning(ctx, strike, time) {
  ctx.save(); ctx.translate(strike.x, strike.y);
  ctx.strokeStyle = strike.hit ? '#e8f7ff' : GOLD;
  ctx.lineWidth = strike.hit ? 3 : 2;
  ctx.setLineDash(strike.hit ? [] : [9, 6]);
  ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  if (strike.hit) {
    ctx.fillStyle = '#e5e8ff24'; ctx.fillRect(-90, -200, 180, 280);
    ctx.beginPath(); ctx.moveTo(18, -260); ctx.lineTo(-15, -110); ctx.lineTo(20, -125); ctx.lineTo(-6, 0); ctx.stroke();
  } else {
    ctx.fillStyle = '#f4c67a0c'; ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = GOLD; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('STRIKE', 0, -8); ctx.fillText(`${Math.max(0, 1.8 - strike.age).toFixed(1)}s`, 0, 13);
    ctx.beginPath(); ctx.arc(0, 0, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * strike.age / 1.8); ctx.stroke();
  }
  ctx.restore();
}

function drawRain(ctx, time) {
  ctx.strokeStyle = '#b1c9d326'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 100; i++) {
    const x = (i * 127.3 + time * 140) % 1400 - 60;
    const y = (i * 79.1 + time * 320) % 580 + 110;
    ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 16);
  }
  ctx.stroke();
}
