# First Click: a real A/B test on a live service page, run with Flagsmith Experimentation

Entry for **Toggle Wars: The Flagsmith Experimentation Hackathon** (WeMakeDevs, Nov 26-29, 2026), **Track 01: Test Something Real**.

Status: scope only. Hacking window opens Nov 26, 8:00 AM IST. Rule 04 of the event allows a head start ("try Flagsmith and start building your idea with it before the hackathon begins").

## The question

Design Master Solutions runs real service pages that get real visitors every day. The first action we care about on those pages is a visitor starting a conversation (the contact button). We do not know which wording of the main call to action gets more first clicks.

**Hypothesis:** a call to action that names the outcome ("Get a quote today") gets more first clicks than the generic one the page uses today ("Contact us").

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
