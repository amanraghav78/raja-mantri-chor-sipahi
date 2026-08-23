const listeners = new Set();

export function pushToast(message, type = "info") {
  const toast = { id: crypto.randomUUID(), message, type };
  listeners.forEach((fn) => fn(toast));
}

export function subscribeToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
