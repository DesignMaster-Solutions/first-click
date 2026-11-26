// Live check: every arm of cta_text comes back from the edge API with a variant key.
// A Flagsmith variation without a key records no exposures, so the experiment would show zero traffic.
// Run: node test/variant-keys.test.mjs  (reads flags only; sends no events, so it adds nothing to the experiment)
const ENV_KEY = 'cEah9PMHR4vhyqmBX4o9FJ';
const seen = {};
for (let i = 0; i < 30; i++) {
  const r = await fetch(`https://edge.api.flagsmith.com/api/v1/identities/?identifier=qa-keys-${i}`, {
    headers: { 'X-Environment-Key': ENV_KEY },
  });
  if (!r.ok) throw new Error(`edge API ${r.status}`);
  const f = (await r.json()).flags.find((x) => x.feature.name === 'cta_text');
  seen[f.feature_state_value] = f.variant ?? null;
}
console.log(JSON.stringify(seen));
const arms = Object.entries(seen);
const ok = arms.length === 2 && arms.every(([, k]) => k) && seen['Start a project'] === 'control';
if (!ok) process.exit(1);
