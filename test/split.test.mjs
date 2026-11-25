// Live check: N test identities against the Flagsmith edge API must split between the two texts.
// Run: node test/split.test.mjs [N]
const KEY = 'cEah9PMHR4vhyqmBX4o9FJ';
const N = Number(process.argv[2] || 40);
const TEXTS = ['Contact us', 'Get a quote today'];
const counts = Object.fromEntries(TEXTS.map((t) => [t, 0]));
for (let i = 0; i < N; i++) {
  const r = await fetch(`https://edge.api.flagsmith.com/api/v1/identities/?identifier=qa-split-${i}`, {
    headers: { 'X-Environment-Key': KEY },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const f = (await r.json()).flags.find((x) => x.feature.name === 'cta_text');
  if (!TEXTS.includes(f.feature_state_value)) throw new Error(`unexpected value ${f.feature_state_value}`);
  counts[f.feature_state_value]++;
}
console.log(JSON.stringify(counts));
for (const t of TEXTS) if (counts[t] < N * 0.25) throw new Error(`split too skewed: ${JSON.stringify(counts)}`);
// Same identity must always get the same text (sticky assignment).
const again = async () => (await (await fetch('https://edge.api.flagsmith.com/api/v1/identities/?identifier=qa-split-0', { headers: { 'X-Environment-Key': KEY } })).json()).flags.find((x) => x.feature.name === 'cta_text').feature_state_value;
if ((await again()) !== (await again())) throw new Error('assignment not sticky');
console.log('ok: split and sticky');
