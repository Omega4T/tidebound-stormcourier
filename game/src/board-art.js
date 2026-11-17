// Paper board rendering shares all collision positions with the playable simulation.
import { REGIONS, driftwood } from './regions.js';
const INK = '#173d4b', PAPER = '#eee5ca', ACCENT = '#9c3c28';

function oval(ctx,x,y,rx,ry,fill,stroke) {
  ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function island(ctx,a) {
  ctx.lineWidth=1;
  oval(ctx,a.x,a.y,a.rx+13,a.ry+13,null,'#718a8b');
  oval(ctx,a.x,a.y,a.rx+6,a.ry+6,null,'#718a8b');
  oval(ctx,a.x+3,a.y+4,a.rx,a.ry,'#173d4b');
  oval(ctx,a.x,a.y,a.rx,a.ry,PAPER,INK);
  ctx.save();ctx.beginPath();ctx.ellipse(a.x,a.y,a.rx-4,a.ry-4,0,0,Math.PI*2);ctx.clip();
  ctx.strokeStyle='#9aab9b';
  for(let x=a.x-a.rx-30;x<a.x+a.rx;x+=12){ctx.beginPath();ctx.moveTo(x,a.y-a.ry);ctx.lineTo(x+90,a.y+a.ry);ctx.stroke();}
  ctx.restore();
  if(a.village){
    for(let i=0;i<3;i++){
      const x=a.x-28+i*23,y=a.y+Math.sin(i*3)*10;
      ctx.fillStyle=INK;ctx.fillRect(x-5,y-3,11,10);
      ctx.beginPath();ctx.moveTo(x-8,y-4);ctx.lineTo(x,y-12);ctx.lineTo(x+8,y-4);ctx.fill();
    }
  }
  if(a.light){
    ctx.fillStyle=INK;ctx.fillRect(a.x+20,a.y-37,10,33);
    ctx.fillStyle=PAPER;ctx.fillRect(a.x+22,a.y-31,6,6);
    ctx.fillStyle=ACCENT;ctx.fillRect(a.x+16,a.y-43,18,7);
  }
}
function ship(ctx,boat,time) {
  ctx.save();ctx.translate(boat.x,boat.y);ctx.rotate(boat.angle+Math.PI/2);
  if(boat.invulnerable>0 && Math.floor(time*12)%2===0)ctx.globalAlpha=.55;
  ctx.fillStyle='#173d4b';ctx.beginPath();ctx.moveTo(3,-24);ctx.lineTo(-10,18);ctx.lineTo(3,26);ctx.lineTo(16,18);ctx.closePath();ctx.fill();
  ctx.fillStyle=ACCENT;ctx.strokeStyle=INK;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(-12,14);ctx.lineTo(0,22);ctx.lineTo(12,14);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=PAPER;ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(-1,8);ctx.lineTo(-20,5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(2,-18);ctx.lineTo(2,7);ctx.lineTo(17,6);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.restore();
}
export function drawBoard(ctx,state,time) {
  const region=REGIONS[state.region];
  ctx.fillStyle=state.region===2?'#b7c6c9':'#c1d1cc';ctx.fillRect(0,0,1280,720);
  ctx.strokeStyle='#748e8c';ctx.lineWidth=.7;
  for(let y=185;y<630;y+=37){
    for(let x=40;x<1250;x+=105){
      ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+9,y-5,x+18,y+5,x+27,y);ctx.stroke();
    }
  }
  region.islands.forEach(a=>island(ctx,a));
  ctx.font='11px Courier New';ctx.textAlign='left';ctx.fillStyle=INK;
  ctx.fillText(region.subtitle,36,179);
  ctx.save();ctx.translate(935,580);ctx.rotate(-.13);ctx.font='italic 24px Georgia';ctx.fillStyle='#355d65';ctx.fillText(region.name,0,0);ctx.restore();
  for(const reef of region.reefs){
    oval(ctx,reef.x,reef.y,reef.r+9,reef.r+9,PAPER,INK);
    ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.beginPath();
    ctx.moveTo(reef.x-9,reef.y-9);ctx.lineTo(reef.x+9,reef.y+9);
    ctx.moveTo(reef.x+9,reef.y-9);ctx.lineTo(reef.x-9,reef.y+9);ctx.stroke();
    ctx.font='9px Courier New';ctx.textAlign='center';ctx.fillStyle=INK;ctx.fillText('REEF',reef.x,reef.y+reef.r+22);
  }
  region.buoys.forEach((buoy,index)=>{
    const lit=state.signals.includes(index);
    ctx.lineWidth=2;oval(ctx,buoy.x+2,buoy.y+3,24,24,INK);
    oval(ctx,buoy.x,buoy.y,24,24,lit?INK:PAPER,INK);
    ctx.font='bold 23px Georgia';ctx.textAlign='center';ctx.fillStyle=lit?PAPER:ACCENT;ctx.fillText(lit?'✓':index+1,buoy.x,buoy.y+8);
    ctx.font='bold 11px Arial';ctx.fillStyle=INK;ctx.fillText(lit?'SIGNAL LIT':'CHANNEL SIGNAL',buoy.x,buoy.y-36);
  });
  region.salvage.forEach((crate,index)=>{
    if(state.taken.includes(index))return;
    ctx.save();ctx.translate(crate.x,crate.y);ctx.rotate(.13);
    ctx.fillStyle=PAPER;ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.fillRect(-10,-10,20,20);ctx.strokeRect(-10,-10,20,20);
    ctx.beginPath();ctx.moveTo(-7,-7);ctx.lineTo(7,7);ctx.moveTo(7,-7);ctx.lineTo(-7,7);ctx.stroke();ctx.restore();
  });
  for(const wreck of driftwood(state.region,state.elapsed)){
    ctx.fillStyle=INK;ctx.fillRect(wreck.x-20,wreck.y-6,40,12);ctx.fillStyle=PAPER;ctx.fillRect(wreck.x-13,wreck.y-3,26,6);
  }
  if(state.region>0){
    ctx.strokeStyle=INK;ctx.lineWidth=1.5;
    for(let y=245;y<560;y+=90){ctx.beginPath();ctx.moveTo(355,y);ctx.lineTo(465,y);ctx.lineTo(454,y-6);ctx.moveTo(465,y);ctx.lineTo(454,y+6);ctx.stroke();}
  }
  const dock=region.dock;
  ctx.strokeStyle=ACCENT;ctx.lineWidth=2;ctx.setLineDash([5,5]);oval(ctx,dock.x,dock.y,48,37,null,ACCENT);ctx.setLineDash([]);
  ctx.fillStyle=PAPER;ctx.fillRect(dock.x-110,dock.y+47,220,40);
  ctx.font='bold 13px Georgia';ctx.textAlign='center';ctx.fillStyle=INK;ctx.fillText(region.beacon,dock.x,dock.y+63);
  ctx.font='10px Courier New';ctx.fillText(state.signals.length===2?'E: DELIVER FUEL':`CHANNEL SIGNALS ${state.signals.length}/2`,dock.x,dock.y+79);
  state.wake.forEach(p=>{ctx.globalAlpha=Math.max(0,(1-p.age/1.3)*.35);ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,10+p.age*8,0,Math.PI);ctx.stroke();});ctx.globalAlpha=1;
  for(const strike of state.lightning){
    ctx.lineWidth=strike.hit?5:2;ctx.setLineDash(strike.hit?[]:[7,5]);oval(ctx,strike.x,strike.y,62,62,null,ACCENT);ctx.setLineDash([]);
    ctx.fillStyle=PAPER;ctx.fillRect(strike.x-40,strike.y-13,80,25);ctx.font='bold 12px Arial';ctx.textAlign='center';ctx.fillStyle=ACCENT;
    ctx.fillText(strike.hit?'STRIKE':`${Math.max(0,1.8-strike.age).toFixed(1)}s`,strike.x,strike.y+4);
  }
  ship(ctx,state.boat,time);
}
