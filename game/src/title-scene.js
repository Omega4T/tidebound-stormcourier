// A dedicated, original title-screen seascape. This is the real menu renderer.
import { polygon, ellipse, drawBoat, drawIsland } from './coastal-art.js';
import { REGIONS } from './regions.js';

function paintSky(ctx, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, 390);
  sky.addColorStop(0, '#082332');
  sky.addColorStop(.58, '#326373');
  sky.addColorStop(1, '#c4b290');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 390);
  ellipse(ctx, 1010, 158, 57, 57, '#f5dfac');
  ellipse(ctx, 1014, 156, 51, 51, '#f2ddb0');
  for (let i = 0; i < 7; i++) {
    const x = 560 + i * 118 + Math.sin(time * .035 + i) * 12;
    ellipse(ctx, x, 90 + i % 3 * 46, 150, 12, '#98b1ae0d');
  }
  polygon(ctx, [[440,370],[558,283],[620,302],[703,211],[769,271],
    [838,244],[918,314],[1033,222],[1140,272],[1280,205],[1280,420]], '#3b6269');
  polygon(ctx, [[500,383],[640,331],[724,362],[843,291],[928,326],
    [1090,284],[1180,341],[1280,302],[1280,430]], '#244d59');
  ctx.strokeStyle = '#182f3c'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const x = 750 + i * 37, y = 130 + Math.sin(i * 5) * 17;
    ctx.beginPath(); ctx.moveTo(x - 5,y + 1);ctx.quadraticCurveTo(x,y - 5,x + 5,y + 1);ctx.stroke();
  }
}

function paintWater(ctx, time) {
  const sea = ctx.createLinearGradient(0, 350, 0, 720);
  sea.addColorStop(0, '#547b7d');sea.addColorStop(.2, '#1f515d');sea.addColorStop(1, '#081f30');
  ctx.fillStyle = sea;ctx.fillRect(0, 355, 1280, 365);
  for (let i = 0; i < 68; i++) {
    const y = 365 + i * 5.3;
    const x = 470 + (i * 173.7) % 900;
    const length = 13 + (i * 31) % 90;
    ctx.fillStyle = i % 4 === 0 ? '#e7d8a333' : '#afd1c217';
    ctx.fillRect(x + Math.sin(time * .4 + i) * 8, y, length, 1 + (i % 3 === 0));
  }
  for (let i = 0; i < 24; i++) {
    const y = 365 + i * 7;
    ctx.fillStyle = `rgba(247,218,158,${.15 * (1 - i / 24)})`;
    ctx.fillRect(1000 - i * 2 + Math.sin(time + i) * 8, y, 18 + i * 4, 2);
  }
}

function paintHeadland(ctx, time) {
  polygon(ctx, [[970,432],[1003,384],[1095,372],[1176,404],[1280,406],[1280,720],
    [1200,688],[1158,579],[1068,539],[1032,474]], '#152d37');
  polygon(ctx, [[985,428],[1018,384],[1100,377],[1182,404],[1280,406],
    [1280,444],[1162,450],[1078,443]], '#78826b');
  polygon(ctx, [[1034,454],[1078,443],[1162,450],[1280,444],[1280,483],
    [1170,478],[1094,469]], '#33474a');
  for (let i = 0; i < 27; i++) {
    const x = 1050 + (i * 43) % 220, y = 470 + i * 6;
    ctx.fillStyle = i % 2 ? '#71827b31' : '#030f223e';
    ctx.fillRect(x,y,20 + i % 7 * 3,2);
  }
  // Scale the game's own island/lighthouse art into the menu composition.
  ctx.save();ctx.translate(1092,383);ctx.scale(2.05,2.05);
  drawIsland(ctx, {x:0,y:0,rx:58,ry:21,light:true,village:true},
    {...REGIONS[0],land:'#6a795f',grass:'#7e8d6e'}, time, true);
  ctx.restore();
}

export function drawTitleScene(ctx, time) {
  paintSky(ctx, time);paintWater(ctx, time);paintHeadland(ctx, time);
  // The courier vessel stays the same design as the playable boat.
  ctx.save();ctx.translate(813,550 + Math.sin(time * .65) * 3);ctx.scale(2.05,2.05);
  drawBoat(ctx,{x:0,y:0,angle:-.63,fullSail:true,invulnerable:0},time);ctx.restore();
  ctx.strokeStyle = '#bad4c54a';ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();ctx.ellipse(811,578 + i * 13,48 + i * 22,8,0,.1,Math.PI * .9);ctx.stroke();
  }
  const fade=ctx.createLinearGradient(0,0,0,720);
  fade.addColorStop(0,'#04131d25');fade.addColorStop(.7,'#04131d00');fade.addColorStop(1,'#04131dd9');
  ctx.fillStyle=fade;ctx.fillRect(0,0,1280,720);
  ctx.fillStyle='#b7c9bb';ctx.textAlign='right';ctx.font='10px Trebuchet MS';
  ctx.fillText('THE MORROW ARCHIPELAGO',1218,632);
  ctx.fillStyle='#6f989f';ctx.font='9px Trebuchet MS';
  ctx.fillText('THREE LIGHTS BETWEEN THE COAST AND THE STORM',1218,650);
}
