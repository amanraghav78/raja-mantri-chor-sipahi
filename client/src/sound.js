const MUTE_KEY = "raja-mantri-muted";
let audioCtx;

export function isMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // ignore
  }
}

function getCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone({ freq, duration, delay = 0, type = "sine", gainValue = 0.16 }) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain).connect(ctx.destination);
  const start = ctx.currentTime + delay;
  gain.gain.setValueAtTime(gainValue, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playReveal() {
  tone({ freq: 440, duration: 0.14 });
  tone({ freq: 660, duration: 0.22, delay: 0.12 });
}

export function playCorrect() {
  tone({ freq: 523, duration: 0.12 });
  tone({ freq: 659, duration: 0.12, delay: 0.1 });
  tone({ freq: 784, duration: 0.25, delay: 0.2 });
}

export function playWrong() {
  tone({ freq: 260, duration: 0.35, type: "sawtooth", gainValue: 0.12 });
  tone({ freq: 180, duration: 0.4, delay: 0.15, type: "sawtooth", gainValue: 0.12 });
}

export function playTick() {
  tone({ freq: 880, duration: 0.05, gainValue: 0.08 });
}

export function vibrate(pattern) {
  if (isMuted()) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}
