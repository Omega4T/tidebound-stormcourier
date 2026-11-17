// Every crossing is authored in world coordinates; the same shapes drive art and collision.
export const REGIONS = [
  {
    name: 'Amber Shoals', subtitle: '01 / THE SHELTERED COAST', beacon: 'Morrow Light',
    story: 'The first light has gone dark. Keep its fishing fleet off the shoals.',
    warning: 'REEFS · Ease off full sail before the narrow channel.',
    sea: ['#173e49', '#102b3b'], land: '#557866', grass: '#789174', sky: '#f3c487',
    spawn: { x: 152, y: 548 }, dock: { x: 1055, y: 262 },
    wind: { x: 10, y: -6 }, current: 0,
    islands: [
      { x: 88, y: 624, rx: 148, ry: 58, village: true },
      { x: 408, y: 332, rx: 112, ry: 98, village: true },
      { x: 742, y: 529, rx: 118, ry: 79 },
      { x: 1104, y: 177, rx: 123, ry: 61, village: true, light: true },
      { x: 1238, y: 588, rx: 76, ry: 107 },
    ],
    reefs: [{ x: 520, y: 440, r: 24 }, { x: 591, y: 401, r: 21 }, { x: 785, y: 254, r: 24 }],
    salvage: [{ x: 288, y: 483 }, { x: 565, y: 284 }, { x: 869, y: 400 }],
    buoys: [{ x: 492, y: 510 }, { x: 627, y: 322 }],
    safeRoute: [{ x: 152, y: 548 }, { x: 160, y: 540 }, { x: 550, y: 500 }, { x: 690, y: 420 }, { x: 1055, y: 262 }],
  },
  {
    name: 'The Glass Narrows', subtitle: '02 / THE RUNNING TIDE', beacon: 'Glassward Light',
    story: 'The tide turns between the basalt teeth. Cross the current at an angle.',
    warning: 'TIDE RACE · The luminous current pushes east. Drifting wrecks move with it.',
    sea: ['#164956', '#0d2f42'], land: '#4f6d73', grass: '#78918b', sky: '#b8d9c3',
    spawn: { x: 152, y: 534 }, dock: { x: 1060, y: 294 },
    wind: { x: -8, y: 8 }, current: 40,
    islands: [
      { x: 84, y: 619, rx: 138, ry: 67, village: true },
      { x: 442, y: 195, rx: 91, ry: 81 },
      { x: 450, y: 574, rx: 91, ry: 82 },
      { x: 816, y: 349, rx: 93, ry: 68, village: true },
      { x: 1121, y: 196, rx: 115, ry: 69, village: true, light: true },
      { x: 1198, y: 610, rx: 118, ry: 58 },
    ],
    reefs: [{ x: 394, y: 333, r: 22 }, { x: 533, y: 416, r: 22 }, { x: 907, y: 482, r: 25 }],
    salvage: [{ x: 286, y: 407 }, { x: 618, y: 296 }, { x: 970, y: 410 }],
    buoys: [{ x: 378, y: 434 }, { x: 558, y: 331 }],
    safeRoute: [{ x: 152, y: 534 }, { x: 530, y: 350 }, { x: 790, y: 250 }, { x: 1010, y: 270 }, { x: 1060, y: 294 }],
  },
  {
    name: 'Tempest Reach', subtitle: '03 / THE LAST LIGHT', beacon: 'Stormwatch Light',
    story: 'Stormwatch is the last refuge. Read the lightning circles. Bring the coast home.',
    warning: 'LIGHTNING · Gold circles warn for 1.8 seconds. Leave them before the strike.',
    sea: ['#273e53', '#141e36'], land: '#595e76', grass: '#7b8188', sky: '#d2aac0',
    spawn: { x: 150, y: 548 }, dock: { x: 1080, y: 292 },
    wind: { x: 19, y: 10 }, current: 17,
    islands: [
      { x: 57, y: 613, rx: 128, ry: 64, village: true },
      { x: 338, y: 259, rx: 84, ry: 88 },
      { x: 609, y: 486, rx: 108, ry: 90 },
      { x: 881, y: 179, rx: 82, ry: 54 },
      { x: 1140, y: 195, rx: 126, ry: 72, village: true, light: true },
      { x: 1138, y: 597, rx: 137, ry: 69 },
    ],
    reefs: [{ x: 437, y: 451, r: 28 }, { x: 735, y: 308, r: 26 }, { x: 895, y: 439, r: 26 }],
    salvage: [{ x: 272, y: 450 }, { x: 529, y: 294 }, { x: 930, y: 540 }],
    buoys: [{ x: 483, y: 369 }, { x: 786, y: 395 }],
    safeRoute: [{ x: 150, y: 548 }, { x: 160, y: 540 }, { x: 430, y: 380 }, { x: 700, y: 360 }, { x: 720, y: 370 }, { x: 910, y: 370 }, { x: 1080, y: 292 }],
  },
];

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function solidAt(x, y, region, padding = 10) {
  return region.islands.some(island => (
    ((x - island.x) / (island.rx + padding)) ** 2 +
    ((y - island.y) / (island.ry + padding)) ** 2 < 1
  ));
}

export function driftwood(regionIndex, elapsed) {
  if (!regionIndex) return [];
  return [0, 1, 2].map(index => ({
    x: 330 + ((elapsed * (24 + regionIndex * 7) + index * 237) % 650),
    y: 340 + Math.sin(elapsed * 0.5 + index * 2.7) * 98,
    r: 18,
  }));
}
