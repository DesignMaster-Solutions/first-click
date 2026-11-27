# First Click: a real A/B test on a live service page, run with Flagsmith Experimentation

Entry for **Toggle Wars: The Flagsmith Experimentation Hackathon** (WeMakeDevs, Nov 26-29, 2026), **Track 01: Test Something Real**.

Status: Flagsmith project `first-click` (environment Production) and multivariate flag `cta_text` are live; `snippet/first-click.js` reads it per visitor; `node test/split.test.mjs` checks the 50/50 split and sticky assignment against the live edge API (40 test identities `qa-split-*`: 23/17). The snippet now uses the Flagsmith JS SDK 12.6.0 with `enableEvents`: `getExperimentFlag` records the exposure and the first click sends `cta_click`; `node test/events.test.mjs` sends both for a `qa-events-*` identity and fails unless the events API accepts them (202). Live page: the hero "Start a project" button of https://www.designmastersolutions.com/ carries `data-first-click` and loads `js/first-click.js` (Nov 25); the flag control value was changed to "Start a project" so the control is exactly what the page showed before the test. **Experiment running since Nov 26, 03:13 UTC:** metric `First CTA click` (occurrence of `cta_click`, higher is better) and experiment `Hero CTA wording` (rollout 100%, control "Start a project" 50% / variant "Get a quote today" 50%) were created and started through the Flagsmith Admin API; the exported configuration is in `experiment/`. Before starting we found the variant had no key, and a Flagsmith variation without a key records no exposures (the warehouse had seen only our 2 test events since the page went live). We gave it the key `outcome`; `node test/variant-keys.test.mjs` reads 30 test identities from the edge API and fails unless both arms come back with a variant key (it reads flags only and sends no events, so it adds nothing to the experiment). **Nov 26, 15:15 UTC (12 h in):** 3 exposures (control 2, of which 1 is our own `qa-debug-1126` check; outcome 1), 0 clicks, raw export `experiment/results-2026-11-26T1515Z.json`. The home page alone gets too few visitors to answer the question in four days, so the same flag, metric and experiment now also run on the hero button of the four service pages whose main button already says "Start a project" (web design, app development, website hosting, local SEO). The control is still exactly what each page showed before, one tracked button per page, and the site test `test_first_click_experiment_runs_on_every_start_a_project_hero` fails if a page ever tracks a button whose current text is not the control. Pages with a different main button (app store publishing, Notion templates, WHMCS addons) are left out on purpose. Live check after the deploy (Nov 26, ~15:25 UTC, Chrome on our own machine): /web-design/ loads the SDK and the button carries `data-variant="Start a project"` (control arm); that one visit is ours and is subtracted from the control count in the write-up. Hacking window opened Nov 26, 8:00 AM IST. Rule 04 of the event allows a head start ("try Flagsmith and start building your idea with it before the hackathon begins").

## The question

Design Master Solutions runs real service pages that get real visitors every day. The first action we care about on those pages is a visitor starting a conversation (the contact button). We do not know which wording of the main call to action gets more first clicks.

**Hypothesis:** a call to action that names the outcome ("Get a quote today") gets more first clicks than the generic one the page uses today ("Start a project", the main button of the home page hero at designmastersolutions.com).

- Control: the current button text, unchanged.
- Variant: the outcome wording.
- Metric: `cta_click`, fired on the first click of the main call to action in a visit (fires early, so four days of data can move it).
- Split: 50/50 of visitors, identity = anonymous visitor id kept in the browser.
- Decision rule: ship the variant only if Flagsmith reports a win probability of 95% or more; otherwise keep the control and report the result as inconclusive.

## How Flagsmith is used

1. A multivariate flag holds the two button texts.
2. The page reads the flag with the Flagsmith JavaScript SDK for each visitor identity.
3. `cta_click` events go to the Flagsmith managed warehouse.
4. The experiment in Flagsmith compares the two versions with its Bayesian engine.
5. The winner is rolled out with the same flag, no redeploy.

## What will be in this repo by the deadline

- The page snippet (flag read + event), with setup steps.
- The experiment configuration and the raw result export.
- A short write-up: hypothesis, traffic, result, what we decided and why.
- Demo video (64 s): https://youtu.be/DFE7b3v0_uQ (`video/demo.mp4`, rendered from `video/demo.json`).

## Setup

No install. Node 18 or newer.

```
node test/summarize.test.mjs
node experiment/summarize.mjs
```

The first fails if the write-up forgets to subtract our own visits, or if that subtraction would go below zero. The second prints the table from the newest `experiment/results-*.json`.

Flagsmith project `first-click`, flag `cta_text` (control `Start a project`, variant key `outcome` = `Get a quote today`), metric `First CTA click`, experiment `Hero CTA wording`. The public client key is in `snippet/first-click.js`. The live button is the hero "Start a project" on https://www.designmastersolutions.com/ and on the four service pages named above. Do not send scripted traffic into the live experiment.

## Honesty rules for this entry

- Real visitors only on the live page; no scripted traffic mixed into the live experiment.
- If traffic is too low for a clear result, the write-up says so.
- The control stays exactly what the page shows today, so the test never makes the page worse for half the visitors by design.

## Pipeline check on the live page (Nov 26, 06:15 UTC)

Three hours after the start the results had zero exposures, so before blaming traffic we checked the whole path on the real page. We opened https://www.designmastersolutions.com/ in Chrome with the visitor id set to `qa-debug-1126`: the page loaded the SDK, called `/identities/?identifier=qa-debug-1126`, the edge API answered with `metadata.experiment.in_experiment: true` and variant `control`, the button kept "Start a project", and the page posted to `https://events.api.flagsmith.com/v1/events`. After a results refresh the experiment showed that one exposure (`control: n=1`, hour bucket 06:00 UTC), export in `experiment/results-2026-11-26T0618Z.json`. So the pipeline works end to end and the earlier zero was simply no visitors overnight.

That single `qa-debug-1126` exposure is ours, not a real visitor. It had no click, and the final write-up subtracts it from the control count.

## Results so far and how the write-up numbers are made (Nov 26, 22:04 UTC, ~19 h in)

`node experiment/summarize.mjs` reads the newest raw export and subtracts the exposures we declared as ours in `experiment/own-exposures.json` (the two checks described above). `node test/summarize.test.mjs` fails if that subtraction is skipped or ever goes negative. Today's export (`experiment/results-2026-11-26T2204Z.json`):

| Arm | Exposures | Ours | Real visitors | First CTA clicks |
|---|---|---|---|---|
| control "Start a project" | 4 | 2 | 2 | 0 |
| outcome "Get a quote today" | 2 | 0 | 2 | 0 |

Four real visitors and no clicks: Flagsmith has no inference yet, and with this traffic the honest reading is inconclusive. The final write-up uses the last export before the deadline, produced the same way.
