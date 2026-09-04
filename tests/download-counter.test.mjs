import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACKING, totalFromAsset, readCache, fetchTotal, mountCounter } from '../assets/download-counter.mjs';

const asset = (count) => ({ id: TRACKING.assetId, state: 'uploaded', download_count: count });
const response = (count) => ({ ok: true, json: async () => asset(count) });
function fixture() {
  const elements = Object.fromEntries(['crt-download-count', 'crt-download-status'].map(id => [id, {
    textContent: id === 'crt-download-count' ? '243' : 'Starting total',
    setAttribute(name, value) { this[name] = value; },
  }]));
  return { document: { hidden: false, getElementById: id => elements[id] }, elements };
}

test('starts at 243 and counts only additional recorded asset downloads', () => {
  assert.equal(totalFromAsset(asset(37)), 243);
  assert.equal(totalFromAsset(asset(38)), 244);
  assert.equal(totalFromAsset(asset(137)), 343);
  assert.equal(totalFromAsset(asset(38)), 244); // Reading again never increments.
});
test('rejects wrong assets, reset counters and malformed values', () => {
  for (const value of [null, {}, asset(-1), asset(36), asset(37.5), asset('38'),
    asset(Number.MAX_SAFE_INTEGER), { ...asset(40), id: 1 }, { ...asset(40), state: 'new' }]) {
    assert.throws(() => totalFromAsset(value));
  }
});
test('optional cache rejects corruption and future timestamps', () => {
  assert.equal(readCache(undefined), null);
  assert.equal(readCache({ getItem() { throw Error(); } }), null);
  for (const value of ['bad', '{}', '{"total":1,"checkedAt":100}', '{"total":244,"checkedAt":300}']) {
    assert.equal(readCache({ getItem: () => value }, 200), null);
  }
  assert.deepEqual(readCache({ getItem: () => '{"total":244,"checkedAt":100}' }, 200), { total: 244, checkedAt: 100 });
});
test('API request is metadata-only and errors are not fake increments', async () => {
  assert.equal(await fetchTotal(async (url, options) => {
    assert.equal(url, TRACKING.endpoint);
    assert.equal(options.credentials, 'omit');
    return response(39);
  }), 245);
  await assert.rejects(fetchTotal(async () => ({ ok: false })));
});
test('independent visitors see the same persistent total without local storage', async () => {
  for (let i = 0; i < 2; i++) {
    const f = fixture();
    const counter = mountCounter({ document: f.document, fetch: async () => response(40), now: () => 1000000 });
    await counter.refresh();
    assert.equal(f.elements['crt-download-count'].textContent, '246');
    assert.equal(f.elements['crt-download-count']['aria-label'], '246 downloads');
  }
});
test('repeated page events are throttled, hidden pages do not poll', async () => {
  const f = fixture();
  let calls = 0;
  const counter = mountCounter({ document: f.document, fetch: async () => { calls++; return response(38); }, now: () => 1000000 });
  f.document.hidden = true;
  await counter.refresh();
  assert.equal(calls, 0);
  f.document.hidden = false;
  await Promise.all([counter.refresh(), counter.refresh()]);
  await counter.refresh();
  assert.equal(calls, 1);
  assert.equal(f.elements['crt-download-count'].textContent, '244');
});
test('API failure preserves last recorded total and never blocks download links', async () => {
  const f = fixture();
  const storage = { getItem: () => '{"total":250,"checkedAt":100}' };
  const counter = mountCounter({ document: f.document, storage, fetch: async () => { throw Error('offline'); }, now: () => 1000000 });
  await counter.refresh();
  assert.equal(f.elements['crt-download-count'].textContent, '250');
  assert.equal(f.elements['crt-download-status'].textContent, 'Last recorded total');
});
test('older API caches cannot lower the displayed total', async () => {
  const f = fixture();
  const storage = { getItem: () => '{"total":250,"checkedAt":100}', setItem() {} };
  const counter = mountCounter({ document: f.document, storage, fetch: async () => response(38), now: () => 1000000 });
  await counter.refresh();
  assert.equal(f.elements['crt-download-count'].textContent, '250');
});
test('fresh local cache avoids extra API calls and survives a reload', async () => {
  const f = fixture();
  const storage = { getItem: () => '{"total":251,"checkedAt":999000}' };
  const counter = mountCounter({ document: f.document, storage, fetch: async () => { throw Error('must not fetch'); }, now: () => 1000000 });
  await counter.refresh();
  assert.equal(f.elements['crt-download-count'].textContent, '251');
  assert.equal(f.elements['crt-download-status'].textContent, 'Updated automatically');
});
test('unavailable API without a cache leaves 243 and labels the fallback', async () => {
  const f = fixture();
  const counter = mountCounter({ document: f.document, fetch: async () => ({ ok: false }), now: () => 1000000 });
  await counter.refresh();
  assert.equal(f.elements['crt-download-count'].textContent, '243');
  assert.match(f.elements['crt-download-status'].textContent, /temporarily unavailable/);
});
test('a new download is picked up on the next refresh even with blocked storage', async () => {
  const f = fixture();
  let time = 1000000;
  let downloads = 37;
  const storage = { getItem() { throw Error(); }, setItem() { throw Error(); } };
  const counter = mountCounter({ document: f.document, storage, fetch: async () => response(downloads), now: () => time });
  await counter.refresh();
  assert.equal(f.elements['crt-download-count'].textContent, '243');
  time += TRACKING.refreshMs;
  downloads++;
  await counter.refresh();
  assert.equal(f.elements['crt-download-count'].textContent, '244');
});
