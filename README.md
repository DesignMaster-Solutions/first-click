# First Click: a real A/B test on a live service page, run with Flagsmith Experimentation

Entry for **Toggle Wars: The Flagsmith Experimentation Hackathon** (WeMakeDevs, Nov 26-29, 2026), **Track 01: Test Something Real**.

Status: Flagsmith project `first-click` (environment Production) and multivariate flag `cta_text` are live; `snippet/first-click.js` reads it per visitor; `node test/split.test.mjs` checks the 50/50 split and sticky assignment against the live edge API (40 test identities `qa-split-*`: 23/17). The snippet now uses the Flagsmith JS SDK 12.6.0 with `enableEvents`: `getExperimentFlag` records the exposure and the first click sends `cta_click`; `node test/events.test.mjs` sends both for a `qa-events-*` identity and fails unless the events API accepts them (202). Live page: the hero "Start a project" button of https://www.designmastersolutions.com/ carries `data-first-click` and loads `js/first-click.js` (Nov 25); the flag control value was changed to "Start a project" so the control is exactly what the page showed before the test. **Experiment running since Nov 26, 03:13 UTC:** metric `First CTA click` (occurrence of `cta_click`, higher is better) and experiment `Hero CTA wording` (rollout 100%, control "Start a project" 50% / variant "Get a quote today" 50%) were created and started through the Flagsmith Admin API; the exported configuration is in `experiment/`. Before starting we found the variant had no key, and a Flagsmith variation without a key records no exposures (the warehouse had seen only our 2 test events since the page went live). We gave it the key `outcome`; `node test/variant-keys.test.mjs` reads 30 test identities from the edge API and fails unless both arms come back with a variant key (it reads flags only and sends no events, so it adds nothing to the experiment). Hacking window opened Nov 26, 8:00 AM IST. Rule 04 of the event allows a head start ("try Flagsmith and start building your idea with it before the hackathon begins").

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
- Demo video.

## Honesty rules for this entry

- Real visitors only on the live page; no scripted traffic mixed into the live experiment.
- If traffic is too low for a clear result, the write-up says so.
- The control stays exactly what the page shows today, so the test never makes the page worse for half the visitors by design.
