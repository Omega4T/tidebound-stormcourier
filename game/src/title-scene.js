// The opening screen is an original printed navigation chart of the actual coast.
import { REGIONS } from './regions.js';

const INK = '#173d4b';
const PAPER = '#e9dfc4';
const RUST = '#9c3c28';

function coastline(ctx, x, y, radius, seed) {
  ctx.beginPath();
  for (let i = 0; i <= 64; i++) {
    const a = i / 64 * Math.PI * 2;
    const r = radius * (1 + .16 * Math.sin(a * 3 + seed) + .08 * Math.cos(a * 7));
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r * .56;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
}

function chartIsland(ctx, x, y, radius, seed) {
  ctx.save();
  for (let ring = 3; ring > 0; ring--) {
    coastline(ctx, x, y, radius + ring * 9, seed);
    ctx.strokeStyle = '#173d4b35';ctx.lineWidth = .8;ctx.stroke();
  }
  coastline(ctx,x,y,radius,seed);ctx.fillStyle='#c9c6a2';ctx.fill();
  ctx.strokeStyle=INK;ctx.lineWidth=1.5;ctx.stroke();ctx.clip();
  ctx.strokeStyle='#173d4b46';ctx.lineWidth=.7;
  for (let i=-radius;i<radius;i+=7) {
    ctx.beginPath();ctx.moveTo(x+i,y-radius);ctx.lineTo(x+i+radius,y+radius);ctx.stroke();
  }
  ctx.restore();
}

function lighthouseMark(ctx, x, y, number, name) {
  ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.fillStyle=PAPER;
  ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.font='bold 17px Georgia';ctx.textAlign='center';ctx.fillStyle=RUST;
  ctx.fillText(number,x,y+6);
  ctx.fillStyle=INK;ctx.textAlign='left';ctx.font='bold 12px Courier New';
  ctx.fillText(name.toUpperCase(),x+27,y+4);
  ctx.font='10px Courier New';ctx.fillStyle='#5b736f';ctx.fillText('LIGHT STATION',x+27,y+20);
}

function compass(ctx, x, y) {
  ctx.save();ctx.translate(x,y);ctx.strokeStyle=INK;ctx.lineWidth=1;
  for(let i=0;i<16;i++) {
    const a=i*Math.PI/8;const r=i%2?24:43;
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.sin(a)*r,-Math.cos(a)*r);ctx.stroke();
  }
  ctx.beginPath();ctx.arc(0,0,31,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=RUST;ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(-6,5);ctx.lineTo(0,0);ctx.lineTo(6,5);ctx.fill();
  ctx.fillStyle=INK;ctx.textAlign='center';ctx.font='bold 12px Courier New';ctx.fillText('N',0,-60);ctx.restore();
}

export function drawTitleScene(ctx, time) {
  ctx.fillStyle=PAPER;ctx.fillRect(0,0,1280,720);
  ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.strokeRect(28,28,1224,664);
  ctx.beginPath();ctx.moveTo(548,28);ctx.lineTo(548,692);ctx.stroke();
  // Navigation route joins the real named regions; no fabricated progress.
  ctx.strokeStyle=RUST;ctx.lineWidth=2;ctx.setLineDash([6,7]);
  ctx.beginPath();ctx.moveTo(645,590);ctx.bezierCurveTo(880,590,623,430,819,424);
  ctx.bezierCurveTo(1010,419,889,285,1030,252);ctx.stroke();ctx.setLineDash([]);
  chartIsland(ctx,719,552,61,1);chartIsland(ctx,825,435,98,4);
  chartIsland(ctx,1067,272,124,2);chartIsland(ctx,1112,567,84,5);
  chartIsland(ctx,641,275,44,2);chartIsland(ctx,945,120,59,4);
  lighthouseMark(ctx,686,560,'1',REGIONS[0].beacon);
  lighthouseMark(ctx,810,395,'2',REGIONS[1].beacon);
  lighthouseMark(ctx,1035,226,'3',REGIONS[2].beacon);
  compass(ctx,1170,113);
  ctx.fillStyle=INK;ctx.font='italic 23px Georgia';ctx.textAlign='center';
  ctx.save();ctx.translate(993,490);ctx.rotate(-.23);ctx.fillText('The Glass Narrows',0,0);ctx.restore();
  ctx.font='italic 17px Georgia';ctx.fillStyle='#4d6668';ctx.fillText('Unsurveyed water',725,170);
  // A small moving boat symbol belongs to the menu itself, not to gameplay state.
  ctx.save();ctx.translate(662+Math.sin(time*.3)*4,601);ctx.rotate(-.7);
  ctx.fillStyle=RUST;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(-6,7);ctx.lineTo(6,7);ctx.closePath();ctx.fill();ctx.restore();
  ctx.fillStyle=INK;ctx.textAlign='left';ctx.font='11px Courier New';
  ctx.fillText('MORROW HYDROGRAPHIC OFFICE',582,66);
  ctx.font='9px Courier New';ctx.fillText('CHART 03 / COASTAL LIGHTS & PASSAGES',582,82);
  ctx.fillText('DISTANCES NOT TO SCALE. KEEP CLEAR OF THE SHOALS',582,663);
  ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(1120,639);ctx.lineTo(1210,639);ctx.stroke();
  for(let i=0;i<=3;i++){ctx.beginPath();ctx.moveTo(1120+i*30,635);ctx.lineTo(1120+i*30,643);ctx.stroke();}
}
