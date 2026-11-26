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
console.log('ok', JSON.stringify(s.rows));
