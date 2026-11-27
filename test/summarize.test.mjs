// Offline check: the write-up numbers subtract our own declared exposures and never go negative.
// Run: node test/summarize.test.mjs
import { readFileSync } from 'node:fs';
import { summarize } from '../experiment/summarize.mjs';

const load = (f) => JSON.parse(readFileSync(new URL(`../experiment/${f}`, import.meta.url), 'utf8'));
const own = load('own-exposures.json');
const s = summarize(load('results-2026-11-26T2204Z.json'), own);
const byArm = Object.fromEntries(s.rows.map((r) => [r.arm, r]));
if (byArm.control.real !== 2 || byArm.outcome.real !== 2) throw new Error(`real visitors wrong: ${JSON.stringify(s.rows)}`);
if (!s.verdict.startsWith('inconclusive')) throw new Error(`verdict: ${s.verdict}`);
let threw = false;
try { summarize(load('results-2026-11-26T0618Z.json'), [...own, ...own]); } catch { threw = true; }
if (!threw) throw new Error('more own exposures than total must fail');

function withChance(chance, srm) {
  const results = load('results-2026-11-26T2204Z.json');
  results.payload.metrics[0].inference = { outcome: chance == null ? null : { chance_to_win: chance } };
  if (srm !== undefined) results.payload.srm_p_value = srm;
  return summarize(results, own);
}
const below = withChance(0.6);
if (!below.verdict.startsWith('inconclusive') || !below.verdict.includes('95%')) {
  throw new Error(`60% must stay inconclusive under the predeclared rule: ${below.verdict}`);
}
const hit = withChance(0.95);
if (!hit.verdict.startsWith('threshold reached')) throw new Error(`95% must reach the threshold: ${hit.verdict}`);
const blocked = withChance(0.99, 0.0001);
if (!blocked.verdict.startsWith('blocked')) throw new Error(`sample-ratio mismatch must block: ${blocked.verdict}`);

console.log(`ok control real=${byArm.control.real} clicks=${byArm.control.clicks}`);
console.log(`ok outcome real=${byArm.outcome.real} clicks=${byArm.outcome.clicks}`);
console.log('ok negative count refused');
console.log(`ok below 95%: ${below.verdict}`);
console.log(`ok at 95%: ${hit.verdict}`);
console.log(`ok sample-ratio block: ${blocked.verdict}`);
