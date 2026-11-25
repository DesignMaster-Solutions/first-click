// Live check: exposure + cta_click reach the Flagsmith events API for a test identity.
// Run: npm i --no-save @flagsmith/flagsmith@12.6.0 && node test/events.test.mjs
import { createFlagsmithInstance } from '@flagsmith/flagsmith/isomorphic';

const ENV_KEY = 'cEah9PMHR4vhyqmBX4o9FJ';
const sent = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const r = await realFetch(url, opts);
  if (String(url).includes('events.api.flagsmith.com')) sent.push({ status: r.status, body: String(opts?.body || '') });
  return r;
};

const fs = createFlagsmithInstance();
await fs.init({ environmentID: ENV_KEY, enableEvents: true, fetch: globalThis.fetch });
const id = 'qa-events-' + Date.now(); // test identity, never a real visitor
await fs.identify(id);
const f = fs.getExperimentFlag('cta_text');
fs.trackEvent('cta_click', { metadata: { qa: true } });
await fs.flushEvents();
await fs.close(5000);

const ok = sent.some((s) => s.status < 300 && s.body.includes('cta_click') && s.body.includes(id));
console.log(JSON.stringify({ id, flag: f?.value, posts: sent.map((s) => s.status), ok }));
if (!ok) process.exit(1);
