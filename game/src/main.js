import { createVoyage, startVoyage, interact, chooseDock } from './campaign.js';
import { REGIONS, distance } from './regions.js';
import { updateSailing } from './sailing.js';
import { drawBoard } from './board-art.js';
import { drawTitleScene } from './title-scene.js';
import { unlockAudio, toggleSound, playCue } from './audio.js';
import { pauseScreen, dockScreen, resultScreen, voyageScore } from './screens.js';

const state = createVoyage();
const canvas = document.querySelector('#sea');
const context = canvas.getContext('2d');
const keys = new Set();
const element = id => document.getElementById(id);
let chartOpen = false, paused = false, previousPhase = '', lastTime = 0;
let best = 0;
try { best = Number(localStorage.getItem('stormcourier-best') || 0); } catch {}

function fitStage() {
  const narrowTitle = innerWidth < 760 && innerHeight > innerWidth && state.phase === 'title';
  const scale = Math.min(innerWidth / 1280, innerHeight / 720);
  const stage = element('stage');
  stage.style.position = 'absolute';
  stage.style.left = narrowTitle ? '0' : '50%';
  stage.style.top = narrowTitle ? '0' : '50%';
  stage.style.transform = narrowTitle ? 'none' : `translate(-50%, -50%) scale(${scale})`;
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
function renderModal() {
  const modal = element('modal');
  const wasHidden = modal.hidden;
  const focusedBuy = modal.contains(document.activeElement) ? document.activeElement.dataset.buy : null;
  modal.hidden = !(paused || ['dock', 'won', 'lost'].includes(state.phase));
  if (modal.hidden) return;
  if (paused) modal.innerHTML = pauseScreen();
  else if (state.phase === 'dock') modal.innerHTML = dockScreen(state);
  else {
    const score = voyageScore(state);
    if (state.phase === 'won' && score > best) {
      best = score;
      try { localStorage.setItem('stormcourier-best', String(best)); } catch {}
    }
    modal.innerHTML = resultScreen(state, best);
  }
  if (wasHidden || focusedBuy) {
    const same = focusedBuy && modal.querySelector(`[data-buy="${focusedBuy}"]:not([disabled])`);
    (same || modal.querySelector('button:not([disabled])'))?.focus();
  }
}
function updateInterface() {
  const region = REGIONS[state.region];
  const titleChanged = document.body.classList.contains('title') !== (state.phase === 'title');
  document.body.classList.toggle('title', state.phase === 'title');
  if (titleChanged) fitStage();
  element('title').hidden = state.phase !== 'title';
  element('hud').hidden = state.phase === 'title';
  element('voyage-path').hidden = state.phase === 'title';
  element('region-name').textContent = region.name;
  element('mission').textContent = state.signals.length < 2
    ? `LIGHT CHANNEL SIGNALS ${state.signals.length}/2 → DELIVER TO ${region.beacon.toUpperCase()}`
    : `CHANNEL CLEAR → ${region.beacon.toUpperCase()} · E AT THE GOLD DOCK`;
  element('hull-value').textContent = `${Math.ceil(state.hull)}%`;
  element('hull-meter').style.width = `${state.hull}%`;
  element('sail-meter').style.width = `${state.boat.stamina}%`;
  element('sail-value').textContent = state.boat.fullSail ? 'FULL SAIL' : 'SPACE TO SURGE';
  element('cargo-value').textContent = `${state.cargo} CRATE${state.cargo === 1 ? '' : 'S'}`;
  element('scrap-value').textContent = `${state.scrap} SCRAP · ${state.beacons}/3 LIGHTS`;
  const seconds = Math.ceil(state.timeLeft);
  element('clock-value').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  element('voyage-path').innerHTML = REGIONS.map((r, i) => `<span class="path-node ${i < state.beacons ? 'lit' : i === state.region ? 'current' : ''}">${i < state.beacons ? 'LIT' : `0${i + 1}`} ${r.beacon}</span>`).join('<span>/</span>');
  element('notice').hidden = !state.messageTime || state.phase !== 'sailing';
  element('notice').textContent = state.message;
  element('dock-prompt').hidden = state.phase !== 'sailing' || distance(state.boat, region.dock) > 76;
  element('dock-prompt').querySelector('span').innerHTML = state.signals.length === 2
    ? 'DELIVER LANTERN FUEL<br><small>Channel marked · relight the beacon</small>'
    : `CHANNEL SIGNALS ${state.signals.length}/2<br><small>Light the numbered gold rings first</small>`;
  element('chart').hidden = !chartOpen;
  if (chartOpen) element('chart-content').innerHTML = `<div class="eyebrow">THE STORMCOURIER'S CHART</div><h2>Three lights before nightfall.</h2>${REGIONS.map((r, i) => `<div class="chart-row"><span class="badge">${i < state.beacons ? '✦' : i + 1}</span><div><strong>${r.name} · ${i < state.beacons ? 'RELIT' : i === state.region ? 'SAILING NOW' : 'AHEAD'}</strong><small>${r.warning} · ${i === state.region ? `${state.signals.length}/2 CHANNEL SIGNALS LIT` : '2 SIGNALS → BEACON'}</small></div></div>`).join('')}<p>Light both numbered channel signals in each region, then deliver at the gold dock. Reefs hurt your hull; floating salvage funds repairs and upgrades. Express: 25% speed, +2 delivery scrap, 30% more damage. The chart pauses the storm.</p>`;
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
  const renderTime = matchMedia('(prefers-reduced-motion: reduce)').matches || paused || chartOpen ? 0 : time / 1000;
  if (state.phase === 'title') drawTitleScene(context, 0);
  else drawBoard(context, state, renderTime);
  for (const event of state.events.splice(0)) playCue(event);
  updateInterface(); requestAnimationFrame(frame);
}

addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (key === 'tab') return;
  const onControl = event.target.closest?.('button, input, select, textarea');
  if (onControl && (key === ' ' || key === 'enter')) return;
  if (state.phase === 'sailing' && !paused && !chartOpen && ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) event.preventDefault();
  keys.add(key);
  if (event.repeat) return;
  if (key === 'e' && !paused && !chartOpen) interact(state);
  if (key === 'escape' && chartOpen) toggleChart();
  else if (key === 'p' || key === 'escape') togglePause();
  if (key === 'c') toggleChart();
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
