// Per-player preferences that live only on this device (never on the server):
// theme, sound and whether the how-to-play intro has been seen.

const THEME_KEY = "rmcs-theme";
const SEEN_KEY = "rmcs-seen-intro";

function read(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage blocked (private mode) — preference just won't persist
  }
}

export function getTheme() {
  const stored = read(THEME_KEY, null);
  if (stored === "light" || stored === "dark") return stored;
  const prefersLight =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "dark";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  write(THEME_KEY, theme);
}

export function hasSeenIntro() {
  return read(SEEN_KEY, null) === "1";
}

export function markIntroSeen() {
  write(SEEN_KEY, "1");
}
