const MUTE_KEY = "rmcs-muted";
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

// Created lazily on the first user-triggered sound, so no browser ever sees
// us attempting to autoplay audio on page load.
function getCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone({ freq, duration, delay = 0, type = "sine", gain = 0.14, sweepTo = null }) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  const start = ctx.currentTime + delay;

  osc.frequency.setValueAtTime(freq, start);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, start + duration);

  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

// A short burst of filtered noise — the body of a metallic strike.
function strike({ delay = 0, duration = 0.4, gain = 0.2, bandHz = 2600, q = 1.2 }) {
  if (isMuted()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const frames = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    // exponential decay keeps it a "ting", not a hiss
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 3);
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = bandHz;
  band.Q.value = q;

  const amp = ctx.createGain();
  amp.gain.value = gain;

  src.connect(band).connect(amp).connect(ctx.destination);
  src.start(ctx.currentTime + delay);
}

/** Coin spinning through the air: rising shimmer plus metallic ring. */
export function playCoinFlip() {
  strike({ duration: 0.5, gain: 0.13, bandHz: 3200, q: 0.9 });
  tone({ freq: 880, sweepTo: 1720, duration: 0.5, type: "triangle", gain: 0.07 });
  tone({ freq: 1320, sweepTo: 2100, duration: 0.42, delay: 0.06, type: "sine", gain: 0.05 });
}

/** The coin landing and the seal biting: a low thud under a bright ring. */
export function playSealStamp() {
  tone({ freq: 190, sweepTo: 70, duration: 0.22, type: "sine", gain: 0.24 });
  strike({ duration: 0.62, gain: 0.2, bandHz: 2100, q: 2.4 });
  tone({ freq: 1568, duration: 0.5, delay: 0.02, type: "triangle", gain: 0.09 });
  tone({ freq: 2093, duration: 0.42, delay: 0.05, type: "sine", gain: 0.05 });
}

export function playCorrect() {
  tone({ freq: 523, duration: 0.13, type: "triangle" });
  tone({ freq: 659, duration: 0.13, delay: 0.11, type: "triangle" });
  tone({ freq: 784, duration: 0.3, delay: 0.22, type: "triangle" });
  strike({ delay: 0.22, duration: 0.5, gain: 0.1, bandHz: 3000, q: 1.5 });
}

export function playWrong() {
  tone({ freq: 233, sweepTo: 150, duration: 0.36, type: "sawtooth", gain: 0.1 });
  tone({ freq: 165, sweepTo: 104, duration: 0.44, delay: 0.13, type: "sawtooth", gain: 0.09 });
}

export function playSelect() {
  tone({ freq: 660, duration: 0.07, type: "triangle", gain: 0.09 });
}

export function playWinner() {
  [523, 659, 784, 1047].forEach((freq, i) =>
    tone({ freq, duration: 0.36, delay: i * 0.13, type: "triangle", gain: 0.13 })
  );
  strike({ delay: 0.4, duration: 0.9, gain: 0.14, bandHz: 2400, q: 1.8 });
}

export function playTick() {
  tone({ freq: 920, duration: 0.045, gain: 0.06, type: "square" });
}

export function vibrate(pattern) {
  if (isMuted()) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}
