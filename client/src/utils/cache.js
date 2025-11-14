// Simple TTL cache over localStorage
// Values are JSON-serialized with a timestamp metadata

export function getCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function setCache(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {
    // ignore quota or serialization errors
  }
}

export function isFresh(entry, ttlMs) {
  if (!entry || typeof entry !== 'object') return false;
  const ts = entry.timestamp || 0;
  return Date.now() - ts < ttlMs;
}

export function clearCache(key) {
  try { localStorage.removeItem(key); } catch (_) {}
}
