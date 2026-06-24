# Workshop Demo Script — CI/CD Pipeline

**Time needed:** ~15-20 minutes (Block 2, Parts 2–5 of the workshop)

**Goal:** Show students the full branch → PR → test → merge → deploy loop, including a deliberate integration test failure to demonstrate why automated tests matter.

---

## Setup (do this before the workshop)

- [ ] Repo is public on GitHub
- [ ] GitHub Pages is enabled: **Settings → Pages → Source: GitHub Actions**
- [ ] Branch protection is configured for `master` (see [BRANCH-PROTECTION.md](BRANCH-PROTECTION.md))
- [ ] `master` has the initial commit with all tests passing and site deployed
- [ ] Open two tabs: the repo on GitHub (Actions tab), and the live site

---

## Part A: The Baseline (~5 min)

**What the audience sees:** A working pipeline. Everything green.

### Step A1 — Show the live site

> *"This is a Click Counter. One button, one number, one function. It's trivial — the point isn't the app. The point is what happens around it."*

- Open the deployed GitHub Pages URL
- Click the button a few times — demonstrate it works

### Step A2 — Show the repo structure

> *"Here's the code. `counter.js` has one pure function: `incrementCounter()`. The HTML wires it to a button. There's a Jest test and a Cypress test. And there's this `.github/workflows/ci-cd.yml` file — that's where the magic lives."*

- Walk through: `src/counter.js`, `tests/unit/counter.test.js`, `tests/integration/counter.cy.js`, `.github/workflows/ci-cd.yml`
- Highlight the workflow file:
  1. `unit-test` job — runs Jest
  2. `deploy-preview` job — deploys to a preview URL (`/preview/pr-N/`) — unit tests must pass first
  3. `integration-test-preview` job — runs Cypress **against the deployed preview URL**
  4. `deploy` + `integration-test` — same thing but for production (master only)
- > *"Notice the order: we deploy FIRST, then test against the actual deployed URL. Not localhost. We're testing the real thing."*

### Step A3 — Show a passing PR

> *"Watch what happens when I make a change on a branch."*

```bash
git checkout -b demo/add-counter-test
```

Add a comment or minor change to `counter.js`, commit, push.

```bash
git add src/counter.js
git commit -m "Add extra comment to counter.js"
git push origin demo/add-counter-test
```

- Open a PR on GitHub
- **Show the checks running in order:**
  1. ✓ `unit-test` — green! Unit tests pass.
  2. ▶ `deploy-preview` — deploys to `preview/pr-1/` on GitHub Pages
  3. ▶ `integration-test-preview` — runs Cypress **against the live preview URL**
- > *"See the order? Unit tests pass → deploy the preview → integration tests hit the real deployed URL. We're not testing against localhost — we're testing the actual GitHub Pages deployment. If the page doesn't load, if the JS doesn't execute, Cypress catches it."*
- **All three jobs go green ✓✓✓**
- **Show the PR comment** — the bot posted:
  > *"✅ All checks passed! Preview: https://<user>.github.io/sample-ci-cd/preview/pr-1/"*
- Click the preview URL — it's a live, working copy of the PR changes
- > *"This is staging vs. production. Every PR gets its own live preview. Reviewers don't just read the diff — they click a link and see the change. And the integration test already verified this preview works. This is how Vercel, Netlify, and every major platform work."*
- Merge the PR
- **Show the deploy + integration-test jobs firing** on master (production)
- **Show the cleanup workflow** — it automatically deletes the preview directory when the PR closes
- Refresh the production URL — still works, no preview clutter left behind

---

## Part B: The Deliberate Failure (~10 min)

**What the audience sees:** A change where unit tests pass but integration tests fail — and why that blocks deployment.

### Step B1 — The setup

> *"Now let me show you what happens when your unit tests are fine but your integration tests catch a real problem. This happens ALL the time in practice."*

> *"I'm going to add a feature: the counter should increment by 2 instead of 1. 'It's twice as good!' Let me update the function and its unit test."*

```bash
git checkout master
git pull origin master
git checkout -b feature/double-increment
```

### Step B2 — Make the change (unit test will pass)

**Edit `src/counter.js`:**
- Change the default `by` parameter from `1` to `2` in the DOM wiring call

Change this line in the DOM event listener:
```js
count = incrementCounter(count);   // defaults to +1
```
To:
```js
count = incrementCounter(count);   // we want +2 now!
```

And update the function's default to `2`:
```js
if (by === undefined) {
  by = 2;  // changed from 1
}
```

**Edit `tests/unit/counter.test.js`:**
- Update the expected values to match the new default of +2

Change:
```js
test('increments from 0 to 1 (default increment)', () => {
  expect(incrementCounter(0)).toBe(1);   // old: expects +1
});
```
To:
```js
test('increments from 0 to 2 (default increment)', () => {
  expect(incrementCounter(0)).toBe(2);   // new: expects +2
});
```

Do the same for the "5 → 6" test — make it "5 → 7".

### Step B3 — Run unit tests locally (they pass!)

```bash
npm test
```

> *"Unit tests pass! The function works correctly in isolation. My logic is sound. Let me push this."*

### Step B4 — Push and watch integration fail

```bash
git add src/counter.js tests/unit/counter.test.js
git commit -m "feat: double-increment counter"
git push origin feature/double-increment
```

- Open a PR on GitHub
- **Watch the checks in order:**
  1. ✓ `unit-test` — green! "The unit tests pass!"
  2. ✓ `deploy-preview` — green! "The preview deployed successfully to `/preview/pr-2/`"
  3. ✗ `integration-test-preview` — RED! "But the integration test fails against the deployed preview!"
- > *"The preview IS live. The page exists. Anyone can visit it. But Cypress just told us it's BROKEN. The integration test ran against the real URL and the button doesn't behave as expected."*

### Step B5 — Explain the failure

> *"Let's click through and see WHY."*

- Click the red X → click "Details" → see the Cypress failure
- The Cypress test visited `https://<user>.github.io/sample-ci-cd/preview/pr-2/` — the real deployed page
- It expected the counter to go 0 → 1 → 2 → 3 after three clicks
- But the page actually went 0 → 2 → 4 → 6 because we changed the default increment to 2
- The integration test catches what the unit test couldn't: **the full system, deployed and live, no longer does what the user expects**

> *"This is the key insight: unit tests verify your functions work. Integration tests verify your APP works. They catch different things. You need both."*

### Step B6 — Show merge is blocked

> *"Because branch protection requires ALL status checks to pass, I cannot merge this PR. The red X on integration-test-preview blocks me."*

- Try to merge (or just point out the greyed-out merge button)
- > *"This is the safety net. Without this automated check, I'd merge this PR, `master` would be broken, and the next person who pulls wouldn't know why their counter jumps by 2."*
- > *"The preview IS deployed — you can visit the URL. But the success comment never posted because the integration test failed. The PR stays blocked. The code never reaches production."*

### Step B7 — Fix it

> *"Now let me fix this properly. I have two options: update the integration test to expect +2 each click, or keep the default at +1 and pass `2` explicitly when I want double increments. Let's update the integration test to match the new behavior."*

**Edit `tests/integration/counter.cy.js`:**
```js
cy.get('#increment-btn').click();
cy.get('#counter-value').should('have.text', '2');  // was '1'

cy.get('#increment-btn').click();
cy.get('#counter-value').should('have.text', '4');  // was '2'

cy.get('#increment-btn').click();
cy.get('#counter-value').should('have.text', '6');  // was '3'
```

```bash
git add tests/integration/counter.cy.js
git commit -m "fix: update integration test for double increment"
git push origin feature/double-increment
```

- All checks go green ✓✓✓ — unit-test, deploy-preview, AND integration-test-preview
- **The bot comments** — "✅ All checks passed!" with the live preview URL
- Click the preview URL → show the counter now increments by 2
- > *"Now the integration test ran against THIS preview URL and PASSED. I can click through and verify the change works, before merging. The deployed preview was tested by Cypress — I have proof it works."*
- Merge button is now enabled

### Step B8 — Merge and show deploy

> *"Now everything passes. Let me merge."*

- Merge the PR
- Show the **deploy + integration-test** jobs firing on master (production)
- > *"Same flow on master: deploy to the root URL, then Cypress verifies the production page works."*
- Show the **cleanup workflow** — automatically deletes the preview directory
- Refresh the live production site
- Click the button — now it increments by 2!

> *"The full loop: branch → change → unit-test → deploy preview → integration-test against the live preview URL → see it working → review → merge → deploy to production → test production. Every PR gets deployed and tested BEFORE it touches master. This is how industry teams ship multiple times a day without breaking things."*

---

## Part C: Why This Matters for Research (~3 min)

Bridging back to the audience:

> *"You might be thinking: 'This is a dumb counter app. I train ML models.' Here's the thing:*

> *"Imagine your training script has a `normalize()` function. You change it to handle a new data format. Your unit test passes — `normalize()` returns the right shape. But you didn't update the data loader integration test, and now the loader feeds `normalize()` tensors of the wrong shape. You merge. Two days later, a labmate pulls your code and their experiment crashes after 6 hours of GPU time."*

> *"This is NOT a hypothetical. This is the most common source of lost productivity in research labs. A 5-minute test saves 6 hours of GPU time. A 10-line workflow file saves a week of debugging. CI/CD isn't corporate overhead — it's a force multiplier for anyone who writes code that other people (or future-you) depend on."*

---

## Cleanup (after the demo)

```bash
# Delete the demo branches if desired
git branch -d demo/add-counter-test feature/double-increment
git push origin --delete demo/add-counter-test feature/double-increment
```

Or keep them — they serve as teaching examples.

---

## Talking Points / FAQ

**Q: Why not just run everything locally?**
A: You should! But CI catches what you forget to run. Did you update the integration test? Did you run `npm install` after pulling? The CI remembers for you. Your laptop doesn't run the integration suite when you're tired and trying to merge at 11pm.

**Q: What if tests take too long?**
A: Unit tests should be fast (< 10 seconds). Integration tests can be slower. For research: smoke tests (2 training steps, no crash) are cheap and catch 80% of real bugs.

**Q: Why have both staging and production? Why not just deploy the PR to the main URL?**
A: Because production should never be "maybe works." Staging (the PR preview) is where you test. Production (master) is what your users see. If staging breaks, nobody cares — it's a preview. If production breaks, everyone notices. Separating them means you never have to choose between "ship fast" and "don't break things."

**Q: Can I skip this and just be careful?**
A: Everyone thinks they're careful. The best engineers I've worked with still rely on CI. It's not about skill — it's about having a safety net for the moments you're tired, distracted, or in a hurry.
