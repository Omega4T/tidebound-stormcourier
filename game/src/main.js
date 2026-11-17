import { createVoyage, startVoyage, interact, chooseDock } from './campaign.js';
import { REGIONS, distance } from './regions.js';
import { updateSailing } from './sailing.js';
import { drawWorld } from './coastal-art.js';
import { unlockAudio, toggleSound, playCue } from './audio.js';

const state = createVoyage();
const canvas = document.querySelector('#sea');
const context = canvas.getContext('2d');
const keys = new Set();
const element = id => document.getElementById(id);
let chartOpen = false, paused = false, previousPhase = '', lastTime = 0;
let best = 0;
try { best = Number(localStorage.getItem('stormcourier-best') || 0); } catch {}

function fitStage() {
  const scale = Math.min(innerWidth / 1280, innerHeight / 720);
  element('stage').style.transform = `scale(${scale})`;
}
function beginVoyage() {
  unlockAudio(); startVoyage(state); paused = false; chartOpen = false;
  keys.clear(); previousPhase = ''; updateInterface();
}
function togglePause() {
  if (!['sailing', 'dock'].includes(state.phase)) return;
  paused = !paused; chartOpen = false; previousPhase = ''; updateInterface();
}
function toggleChart() {
  if (state.phase === 'title') return;
  chartOpen = !chartOpen;
  if (chartOpen) paused = false;
  updateInterface();
}
function spendAtDock(choice) {
  unlockAudio();
  if (chooseDock(state, choice)) { previousPhase = ''; updateInterface(); }
}
function summaryMarkup() {
  return `<div class="summary"><div><strong>${state.beacons}/3</strong>BEACONS RELIT</div><div><strong>${Math.round(state.hull)}%</strong>HULL REMAINING</div><div><strong>${state.recovered}</strong>SALVAGE RECOVERED</div><div><strong>${Math.ceil(state.timeLeft)}s</strong>STORM MARGIN</div></div>`;
}
function renderModal() {
  const modal = element('modal');
  const visible = paused || ['dock', 'won', 'lost'].includes(state.phase);
  modal.hidden = !visible;
  if (!visible) return;
  if (paused) {
    modal.innerHTML = '<div class="eyebrow">SAFE HARBOR</div><h2 id="modal-heading">The tide can wait.</h2><p>Voyage paused. Your boat and the storm clock are held.</p><button class="primary" data-action="resume">RESUME · P</button><button class="secondary" data-action="restart">NEW VOYAGE · R</button>';
  } else if (state.phase === 'dock') {
    const next = REGIONS[state.region + 1];
    modal.innerHTML = `<div class="eyebrow">${REGIONS[state.region].beacon.toUpperCase()} / BEACON RELIT</div><h2 id="modal-heading">A little light goes a long way.</h2>${summaryMarkup()}<p>The harbor pays +3 scrap. Choose what you need before ${next.name}.</p><div class="shop"><button data-buy="repair" ${state.scrap < 3 || state.hull >= 100 ? 'disabled' : ''}><b>PATCH HULL · 3 SCRAP</b><small>Restore 45 hull.<br>Trade repairs for upgrades.</small></button><button data-buy="armor" ${state.scrap < 4 || state.armor ? 'disabled' : ''}><b>${state.armor ? 'COPPER HULL FITTED' : 'COPPER HULL · 4 SCRAP'}</b><small>42% less impact damage.<br>Weather the narrow water.</small></button><button data-buy="canvas" ${state.scrap < 4 || state.canvas ? 'disabled' : ''}><b>${state.canvas ? 'STORM CANVAS FITTED' : 'STORM CANVAS · 4 SCRAP'}</b><small>18% more sailing speed.<br>Buy time at greater risk.</small></button></div><div class="route-row"><button data-buy="route">${state.route === 'shelter' ? 'SHELTERED PASSAGE' : 'EXPRESS TIDE'} ↻</button><span>${state.route === 'shelter' ? 'Weaker current and fewer lightning strikes. The careful crossing.' : 'Stronger current and more frequent lightning. Master the faster water.'} · ${state.scrap} SCRAP AVAILABLE</span></div><button class="primary" data-buy="depart">DEPART FOR ${next.name.toUpperCase()} ↗</button>`;
  } else {
    const won = state.phase === 'won';
    const score = Math.round(state.score + state.hull * 10 + state.timeLeft * 5);
    if (won && score > best) {
      best = score;
      try { localStorage.setItem('stormcourier-best', String(best)); } catch {}
    }
    modal.innerHTML = `<div class="eyebrow ${won ? '' : 'loss-label'}">${won ? 'THE COAST IS HOME' : 'VOYAGE LOST'}</div><h2 id="modal-heading">${won ? 'Three lights. One way home.' : 'The sea keeps its stories.'}</h2><p>${won ? 'Every beacon burns again. The fishing fleet follows your lights through the storm.' : state.reason}</p>${summaryMarkup()}<p>VOYAGE SCORE ${score.toLocaleString()} · PERSONAL BEST ${best.toLocaleString()}</p><button class="primary" data-action="restart">SAIL ANOTHER VOYAGE · R</button><button class="secondary" data-action="title">RETURN TO TITLE</button>`;
  }
}
function updateInterface() {
  const region = REGIONS[state.region];
  document.body.classList.toggle('title', state.phase === 'title');
  element('title').hidden = state.phase !== 'title';
  element('hud').hidden = state.phase === 'title';
  element('voyage-path').hidden = state.phase === 'title';
  element('region-name').textContent = region.name;
  element('mission').textContent = `DELIVER TO ${region.beacon.toUpperCase()} · E AT THE GOLD DOCK`;
  element('hull-value').textContent = `${Math.ceil(state.hull)}%`;
  element('hull-meter').style.width = `${state.hull}%`;
  element('sail-meter').style.width = `${state.boat.stamina}%`;
  element('sail-value').textContent = state.boat.fullSail ? 'FULL SAIL' : 'SPACE TO SURGE';
  element('cargo-value').textContent = `${state.cargo} CRATE${state.cargo === 1 ? '' : 'S'}`;
  element('scrap-value').textContent = `${state.scrap} SCRAP · ${state.beacons}/3 LIGHTS`;
  const seconds = Math.ceil(state.timeLeft);
  element('clock-value').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  element('voyage-path').innerHTML = REGIONS.map((r, i) => `<span class="path-node ${i < state.beacons ? 'lit' : i === state.region ? 'current' : ''}">${i < state.beacons ? '✦' : `0${i + 1}`} ${r.beacon}</span>`).join('<span>—</span>');
  element('notice').hidden = !state.messageTime || state.phase !== 'sailing';
  element('notice').textContent = state.message;
  element('dock-prompt').hidden = state.phase !== 'sailing' || distance(state.boat, region.dock) > 76;
  element('chart').hidden = !chartOpen;
  if (chartOpen) element('chart-content').innerHTML = `<div class="eyebrow">THE STORMCOURIER'S CHART</div><h2>Three lights before nightfall.</h2>${REGIONS.map((r, i) => `<div class="chart-row"><span class="badge">${i < state.beacons ? '✦' : i + 1}</span><div><strong>${r.name} · ${i < state.beacons ? 'RELIT' : i === state.region ? 'SAILING NOW' : 'AHEAD'}</strong><small>${r.warning}</small></div></div>`).join('')}<p>Gold dock rings mark your destination. Striped reefs hurt the hull. Collect floating salvage to fund repairs and upgrades. The chart pauses the storm.</p>`;
  const phaseKey = `${state.phase}:${paused}:${state.scrap}:${state.route}:${state.hull}:${state.armor}:${state.canvas}`;
  if (phaseKey !== previousPhase) { previousPhase = phaseKey; renderModal(); }
}
function frame(time) {
  const dt = Math.min(.04, lastTime ? (time - lastTime) / 1000 : 0);
  lastTime = time;
  if (!paused && !chartOpen) updateSailing(state, {
    left: keys.has('a') || keys.has('arrowleft'), right: keys.has('d') || keys.has('arrowright'),
    up: keys.has('w') || keys.has('arrowup'), down: keys.has('s') || keys.has('arrowdown'), boost: keys.has(' '),
  }, dt);
  drawWorld(context, state, time / 1000);
  for (const event of state.events.splice(0)) playCue(event);
  updateInterface(); requestAnimationFrame(frame);
}

addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'tab'].includes(key)) event.preventDefault();
  keys.add(key);
  if (event.repeat) return;
  if (key === 'e' && !paused && !chartOpen) interact(state);
  if (key === 'p' || key === 'escape') togglePause();
  if (key === 'c' || key === 'tab') toggleChart();
  if (key === 'r' && state.phase !== 'title') beginVoyage();
  if (key === 'm') element('mute-button').click();
});
addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
addEventListener('blur', () => { keys.clear(); if (state.phase === 'sailing' && !paused) togglePause(); });
element('start').addEventListener('click', beginVoyage);
element('pause-button').addEventListener('click', togglePause);
element('chart-button').addEventListener('click', toggleChart);
element('close-chart').addEventListener('click', toggleChart);
element('mute-button').addEventListener('click', () => {
  unlockAudio(); element('mute-button').textContent = `M SOUND ${toggleSound() ? 'ON' : 'OFF'}`;
});
element('modal').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.buy) spendAtDock(button.dataset.buy);
  if (button.dataset.action === 'restart') beginVoyage();
  if (button.dataset.action === 'resume') togglePause();
  if (button.dataset.action === 'title') { Object.assign(state, createVoyage()); paused = false; chartOpen = false; previousPhase = ''; }
});
addEventListener('resize', fitStage);
// Read-only diagnostics let tests observe actual input-driven gameplay.
window.stormcourier = Object.freeze({ getState: () => JSON.parse(JSON.stringify(state)) });
fitStage(); updateInterface(); requestAnimationFrame(frame);
