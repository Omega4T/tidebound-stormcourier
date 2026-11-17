// Original compact audio palette; oscillators begin only after a user gesture.
let context;
let enabled = true;
export function unlockAudio() {
  context ||= new (window.AudioContext || window.webkitAudioContext)();
  if (context.state === 'suspended') context.resume();
}
export function toggleSound() { enabled = !enabled; return enabled; }
export function playCue(kind) {
  if (!context || !enabled) return;
  const notes = { start: [220, 330, 440], beacon: [330, 440, 660, 880], salvage: [520, 780],
    impact: [110, 70], loss: [180, 130, 90], upgrade: [440, 550, 660], warning: [640, 640],
    thunder: [65, 45], depart: [260, 390] }[kind];
  if (!notes) return;
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const time = context.currentTime + index * .1;
    oscillator.type = kind === 'impact' || kind === 'thunder' ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(.09, time + .012);
    gain.gain.exponentialRampToValueAtTime(.001, time + .26);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(time); oscillator.stop(time + .28);
  });
}
