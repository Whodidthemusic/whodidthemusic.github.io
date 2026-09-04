// GitHub stores the shared, durable download count. Browser storage only caches it.
// Keep this baseline fixed: 243 was the publisher's requested total on 2026-09-03.
export const TRACKING = Object.freeze({
  startingTotal: 243,
  assetBaseline: 37,
  assetId: 525405245,
  endpoint: 'https://api.github.com/repos/Whodidthemusic/whodidthemusic.github.io/releases/assets/525405245',
  cacheKey: 'egocorp:crt-downloads:525405245:243:37:v1',
  refreshMs: 5 * 60 * 1000,
});

export function totalFromAsset(asset) {
  if (asset?.id !== TRACKING.assetId || asset.state !== 'uploaded' ||
      !Number.isSafeInteger(asset.download_count) ||
      asset.download_count < TRACKING.assetBaseline) {
    throw new Error('Invalid download record');
  }
  const total = TRACKING.startingTotal + asset.download_count - TRACKING.assetBaseline;
  if (!Number.isSafeInteger(total)) throw new Error('Invalid download total');
  return total;
}

export function readCache(storage, now = Date.now()) {
  try {
    const value = JSON.parse(storage.getItem(TRACKING.cacheKey));
    if (value && Number.isSafeInteger(value.total) &&
        value.total >= TRACKING.startingTotal &&
        Number.isSafeInteger(value.checkedAt) &&
        value.checkedAt > 0 && value.checkedAt <= now) return value;
  } catch { /* Storage can be blocked in private browsing. */ }
  return null;
}

export async function fetchTotal(fetchImpl = fetch, signal) {
  const response = await fetchImpl(TRACKING.endpoint, {
    headers: { Accept: 'application/vnd.github+json' },
    credentials: 'omit',
    signal,
  });
  if (!response.ok) throw new Error('Download statistics temporarily unavailable');
  return totalFromAsset(await response.json());
}

export function mountCounter({ document, fetch: fetchImpl, storage, now = Date.now }) {
  const number = document.getElementById('crt-download-count');
  const status = document.getElementById('crt-download-status');
  if (!number || !status) return null;
  let inFlight = false;
  let nextAttemptAt = 0;
  let cached = readCache(storage, now());
  let shownTotal = TRACKING.startingTotal;

  function show(total, message) {
    shownTotal = total;
    const formatted = new Intl.NumberFormat('en-US').format(total);
    number.textContent = formatted;
    number.setAttribute('aria-label', `${formatted} downloads`);
    status.textContent = message;
  }

  if (cached) show(cached.total, 'Last recorded total');

  async function refresh() {
    if (document.hidden || inFlight || now() < nextAttemptAt) return;
    if (cached && now() - cached.checkedAt < TRACKING.refreshMs) {
      show(cached.total, 'Updated automatically');
      return;
    }
    inFlight = true;
    nextAttemptAt = now() + TRACKING.refreshMs;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const total = await fetchTotal(fetchImpl, controller.signal);
      // A cached API response must not make the visible counter go backwards.
      cached = { total: Math.max(shownTotal, total), checkedAt: now() };
      show(cached.total, 'Updated automatically');
      try { storage.setItem(TRACKING.cacheKey, JSON.stringify(cached)); } catch { /* Optional cache. */ }
    } catch {
      status.textContent = cached ? 'Last recorded total' : 'Starting total · updates temporarily unavailable';
    } finally {
      clearTimeout(timeout);
      inFlight = false;
    }
  }
  return { refresh };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  let storage;
  try { storage = window.localStorage; } catch { /* Storage is optional. */ }
  const counter = mountCounter({ document, fetch: window.fetch.bind(window), storage });
  if (counter) {
    counter.refresh();
    document.addEventListener('visibilitychange', counter.refresh);
    window.addEventListener('pageshow', counter.refresh);
    setInterval(counter.refresh, TRACKING.refreshMs);
  }
}
