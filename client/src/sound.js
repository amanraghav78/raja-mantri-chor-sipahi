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

// Created lazily on the first user-triggered sound so no browser ever sees us
// trying to autoplay audio on page load.
function getCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone({ freq, duration, delay = 0, type = "sine", gainValue = 0.14 }) {
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

export function playFlip() {
  tone({ freq: 320, duration: 0.09, type: "triangle", gainValue: 0.1 });
}

export function playReveal() {
  tone({ freq: 523, duration: 0.14, type: "triangle" });
  tone({ freq: 784, duration: 0.26, delay: 0.11, type: "triangle" });
}

export function playCorrect() {
  tone({ freq: 523, duration: 0.12 });
  tone({ freq: 659, duration: 0.12, delay: 0.1 });
  tone({ freq: 784, duration: 0.3, delay: 0.2 });
}

export function playWrong() {
  tone({ freq: 233, duration: 0.32, type: "sawtooth", gainValue: 0.1 });
  tone({ freq: 165, duration: 0.42, delay: 0.14, type: "sawtooth", gainValue: 0.1 });
}

export function playRoundEnd() {
  tone({ freq: 392, duration: 0.16, type: "triangle", gainValue: 0.1 });
}

export function playWinner() {
  [523, 659, 784, 1047].forEach((freq, i) =>
    tone({ freq, duration: 0.34, delay: i * 0.13, type: "triangle" })
  );
}

export function playTick() {
  tone({ freq: 880, duration: 0.05, gainValue: 0.07 });
}

export function vibrate(pattern) {
  if (isMuted()) return;
  if (navigator.vibrate) navigator.vibrate(pattern);
}
