// Turns a raw Flagsmith results export into the write-up numbers, minus our own declared visits.
// Run: node experiment/summarize.mjs [results-file]   (default: newest experiment/results-*.json)
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));

export function summarize(results, own) {
  const m = results.payload.metrics[0];
  const arms = Object.keys(m.variants);
  const rows = arms.map((arm) => {
    const ours = own.filter((o) => o.arm === arm).length;
    const { n, sum } = m.variants[arm];
    const real = n - ours;
    if (real < 0) throw new Error(`${arm}: more own exposures (${ours}) than total (${n})`);
    return { arm, exposures: n, ours, real, clicks: sum, rate: real ? sum / real : null };
  });
  const verdict = m.inference && Object.values(m.inference).some((v) => v) ? 'see Flagsmith inference' : 'inconclusive: no inference yet';
  return { as_of: results.as_of, rows, verdict };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2] || dir + readdirSync(dir).filter((f) => /^results-.*\.json$/.test(f)).sort().at(-1);
  const s = summarize(JSON.parse(readFileSync(file, 'utf8')), JSON.parse(readFileSync(dir + 'own-exposures.json', 'utf8')));
  console.log(`As of ${s.as_of}\n\n| Arm | Exposures | Ours | Real visitors | First CTA clicks | Rate |\n|---|---|---|---|---|---|`);
  for (const r of s.rows) console.log(`| ${r.arm} | ${r.exposures} | ${r.ours} | ${r.real} | ${r.clicks} | ${r.rate === null ? 'n/a' : (100 * r.rate).toFixed(1) + '%'} |`);
  console.log(`\nVerdict: ${s.verdict}`);
}
