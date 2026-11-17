import { REGIONS } from './regions.js';

export function voyageSummary(state) {
  return `<div class="summary">
    <div><strong>${state.beacons}/3</strong>BEACONS RELIT</div>
    <div><strong>${Math.round(state.hull)}%</strong>HULL REMAINING</div>
    <div><strong>${state.recovered}</strong>SALVAGE RECOVERED</div>
    <div><strong>${Math.ceil(state.timeLeft)}s</strong>STORM MARGIN</div>
  </div>`;
}

export function pauseScreen() {
  return `<div class="eyebrow">SAFE HARBOR</div>
    <h2 id="modal-heading">The tide can wait.</h2>
    <p>Voyage paused. Your boat and the storm clock are held.</p>
    <button class="primary" data-action="resume">RESUME · P</button>
    <button class="secondary" data-action="restart">NEW VOYAGE · R</button>`;
}

export function dockScreen(state) {
  const next = REGIONS[state.region + 1];
  const express = state.route === 'express';
  return `<div class="eyebrow">${REGIONS[state.region].beacon.toUpperCase()} / BEACON RELIT</div>
    <h2 id="modal-heading">A little light goes a long way.</h2>
    ${voyageSummary(state)}
    <p>Harbor paid +${state.lastPayment} scrap for this delivery.
       Choose what you need before ${next.name}.</p>
    <div class="shop">
      <button data-buy="repair" ${state.scrap < 3 || state.hull >= 100 ? 'disabled' : ''}>
        <b>PATCH HULL · 3 SCRAP</b>
        <small>Restore 45 hull.<br>Trade repairs for upgrades.</small>
      </button>
      <button data-buy="armor" ${state.scrap < 4 || state.armor ? 'disabled' : ''}>
        <b>${state.armor ? 'COPPER HULL FITTED' : 'COPPER HULL · 4 SCRAP'}</b>
        <small>42% less impact damage.<br>Weather the narrow water.</small>
      </button>
      <button data-buy="canvas" ${state.scrap < 4 || state.canvas ? 'disabled' : ''}>
        <b>${state.canvas ? 'STORM CANVAS FITTED' : 'STORM CANVAS · 4 SCRAP'}</b>
        <small>18% more sailing speed.<br>Buy time at greater risk.</small>
      </button>
    </div>
    <div class="route-row">
      <button data-buy="route">${express ? 'EXPRESS TIDE' : 'SHELTERED PASSAGE'} ↻</button>
      <span>${express
        ? '25% faster, +2 scrap per delivery; 30% more damage and more lightning.'
        : 'Standard speed and damage; +3 scrap per delivery. The careful crossing.'}
        · ${state.scrap} SCRAP AVAILABLE</span>
    </div>
    <button class="primary" data-buy="depart">DEPART FOR ${next.name.toUpperCase()} ↗</button>`;
}

export function voyageScore(state) {
  return Math.round(state.score + state.hull * 10 + state.timeLeft * 5);
}

export function resultScreen(state, best) {
  const won = state.phase === 'won';
  return `<div class="eyebrow ${won ? '' : 'loss-label'}">
      ${won ? 'THE COAST IS HOME' : 'VOYAGE LOST'}
    </div>
    <h2 id="modal-heading">${won ? 'Three lights. One way home.' : 'The sea keeps its stories.'}</h2>
    <p>${won
      ? 'Every beacon burns again. The fishing fleet follows your lights through the storm.'
      : state.reason}</p>
    ${voyageSummary(state)}
    <p>VOYAGE SCORE ${voyageScore(state).toLocaleString()} · PERSONAL BEST ${best.toLocaleString()}</p>
    <button class="primary" data-action="restart">SAIL ANOTHER VOYAGE · R</button>
    <button class="secondary" data-action="title">RETURN TO TITLE</button>`;
}
