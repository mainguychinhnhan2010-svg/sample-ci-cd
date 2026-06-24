# sample-ci-cd

A dead-simple Click Counter website used to demonstrate CI/CD with GitHub Actions.

Part of the **Orientation Seminar** workshop for new AI lab students.

🔗 **Production:** [mainguychinhnhan2010-svg.github.io/sample-ci-cd](https://mainguychinhnhan2010-svg.github.io/sample-ci-cd/)

## What this is

This is a companion demo project that shows:

- **Branch protection:** `master` is locked — no direct pushes
- **Automated testing:** unit tests (Jest) + integration tests (Cypress)
- **Secret scanning:** gitleaks scans every commit for accidentally committed secrets
- **Performance & accessibility budgets:** Lighthouse CI gates every PR
- **CI/CD pipeline:** push → scan + test → deploy to GitHub Pages
- **PR workflow:** branch → PR → status checks → review → merge

## Local development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Start the dev server
npm start
# → opens at http://localhost:8080

# Run integration tests (in another terminal, with the server running)
npx cypress run
# or for the interactive Cypress UI:
npx cypress open

# Run Lighthouse CI locally (against localhost)
npm run lhci
```

### Pre-push hooks

[Husky](https://typicode.github.io/husky/) pre-push hooks run before every `git push`. If either check fails, the push is rejected:

```bash
git push                         # runs npm test + gitleaks first
                                 # blocks push if tests OR secret scan fail
git push --no-verify             # skip hooks (emergency escape hatch)
```

**Two checks:**
1. **Unit tests** (`npm test`) — catches broken logic before it leaves your machine
2. **Secret scan** (`gitleaks detect`) — catches leaked API keys, tokens, and passwords before they leave your machine. If gitleaks isn't installed locally, the hook warns and continues (CI will still catch secrets, but by then it's too late — rotation is required).

## How it works

| File | Purpose |
|---|---|
| `src/index.html` | The page — a heading, a counter, a button |
| `src/counter.js` | The logic — a pure `incrementCounter()` function + DOM wiring |
| `tests/unit/counter.test.js` | Jest tests for the pure function |
| `tests/integration/counter.cy.js` | Cypress tests for the full page |
| `.github/workflows/ci-cd.yml` | The CI/CD pipeline |
| `.github/workflows/lighthouse-monitor.yml` | Scheduled Lighthouse monitoring against production |
| `.gitleaks.toml` | Secret scanning rules — catches API keys, tokens, passwords |
| `.lighthouserc.json` | Lighthouse performance & accessibility budget config |

## The pipeline

```
                                                   ┌── integration-test-preview
PR opened / push ──→ unit-test + secret-scan ──→ deploy-preview ──→ lighthouse-preview
                                                   └── deploy ──────────→ integration-test
                                                        (master only)       (Cypress against production)
```

- **Unit tests** (Jest) run on every push and every PR
- **Secret scanning** (gitleaks) runs in parallel with unit tests — scans every commit for leaked credentials
- **Deploy** fires after both unit tests AND secret scan pass — to `/preview/pr-<N>/` for PRs, to the root `/` for master
- **Integration tests** (Cypress) run **against the deployed URL**, not a local server — tests the real thing
- **PR comment** posts the preview URL only after all checks pass
- **Auto-cleanup:** when a PR is closed or merged, its preview directory is deleted

### Why test against the deployed URL?

Testing against `localhost` tells you the code works on the CI machine. Testing against the deployed GitHub Pages URL tells you the code works **in production**. If the page doesn't load, if the JS doesn't execute, if a path is wrong — Cypress catches it on the real URL, not a local approximation.

| Environment | Trigger | Deploys to | Tested by |
|---|---|---|---|
| **Staging** | PR opened / pushed | `/preview/pr-<N>/` | `integration-test-preview` |
| **Production** | Push to `master` | `/` (root) | `integration-test` |

### Secret scanning — layered defense against leaked credentials

**The problem:** You commit a config file with a test API key. Or a `.env` with a database password. Or a private key you meant to `.gitignore`. It looks innocent — just another file. Three months later, someone scrapes your repo history and starts mining Bitcoin on your lab's AWS account.

**The industry-standard approach: defense in depth.** A single CI check isn't enough — by the time CI scans, the secret is already on GitHub. You need layers:

| Layer | Where | Tool | If it fires... |
|---|---|---|---|
| **Pre-push hook** 🛡️ | Your machine | `gitleaks` | Secret never leaves your machine. Fix and push again. |
| **CI pipeline** 🪂 | GitHub | `gitleaks` (same tool) | Secret already on remote. **Rotation is mandatory.** |

#### Layer 1: Pre-push hook (primary defense)

The [husky pre-push hook](.husky/pre-push) runs `gitleaks detect` before every `git push`. If a secret is found, the push is **blocked on your machine** — it never reaches GitHub. This is the same pattern as the existing test hook:

```bash
git push                         # runs npm test + gitleaks first
                                 # blocks push if either fails
git push --no-verify             # skip hooks (emergency escape hatch)
```

If gitleaks isn't installed, the hook warns you and lets the push through — CI will still catch secrets, but it'll be too late:

```bash
# Install gitleaks (one-time)
winget install gitleaks    # Windows
brew install gitleaks       # macOS
sudo apt install gitleaks   # Linux
```

#### Layer 2: CI pipeline (safety net)

The `secret-scan` job in CI is the **last line of defense**. It runs against every push and PR, scanning all commits in the branch. Uses [`gitleaks/gitleaks-action@v2`](https://github.com/gitleaks/gitleaks-action) with custom rules in [`.gitleaks.toml`](.gitleaks.toml).

**Custom rules detect:** generic API keys, GitHub PATs, AWS keys, private key headers, Slack webhooks, npm tokens — plus ~100 built-in rules (GitLab tokens, GCP/Azure keys, Stripe keys, JWT tokens, `.env` files, DB connection strings, etc.)

**⚠️ When CI catches a secret, it's already on GitHub. You must:**
1. **Rotate the credential immediately** — it's compromised
2. Remove it from the commit (`git rebase -i` or amend)
3. `git push --force` the cleaned history
4. Verify the secret is no longer in GitHub's history

The pre-push hook exists specifically so this never happens. CI is the parachute — you don't want to need it.

### Performance & accessibility budgets

**Tests prove correctness. Budgets prove quality.** Unit and integration tests tell you the code works. Lighthouse budgets tell you the page is fast, accessible, and not bloated. Both gates must pass before a PR can merge.

The `lighthouse-preview` job:

- Runs Lighthouse against the deployed preview URL (same pattern as integration tests)
- Asserts hard numeric budgets defined in [`.lighthouserc.json`](.lighthouserc.json)
- Fails the PR status check if any budget is exceeded — merge button disappears
- Posts a step summary with scores and assertion results
- Uploads the full Lighthouse report as a run artifact

**Budgets enforced:**

| Budget | Limit | Catches |
|---|---|---|
| Category scores | ≥ 90–95% | Accessibility regressions, SEO loss |
| `total:size` | 8 KB | Heavy dependency added |
| `stylesheet:size` | 5 KB | CSS framework pulled in for no reason |
| `script:size` | 5 KB | jQuery just for `onclick` |
| `image:size`, `font:size` | 5 KB | Unoptimized assets |
| `first-contentful-paint` | 2 sec | Render-blocking resources |
| `interactive` | 3 sec | Heavy JS blocking TTI |

### Scheduled monitoring

A separate [cron workflow](.github/workflows/lighthouse-monitor.yml) runs Lighthouse against the production URL daily at 3 AM ICT. It collects 3 runs (median) and stores HTML reports as 90-day artifacts. This catches things the PR gate can't: Lighthouse scoring changes, GitHub Pages infrastructure shifts, a browser engine update that makes a formerly-fast CSS property slow.

Also triggerable manually via `workflow_dispatch` — pass a custom URL or leave blank for production.

## Branch protection (set in GitHub UI)

1. Go to **Settings → Branches → Add branch protection rule**
2. Set branch name pattern to `master`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Add status checks: `Unit Tests`, `Secret Scan`, `Integration Tests (Preview)`, `Lighthouse Audit (Preview)`

See [BRANCH-PROTECTION.md](BRANCH-PROTECTION.md) for detailed setup instructions.

## Live demo

See [DEMO-SCRIPT.md](DEMO-SCRIPT.md) for the step-by-step workshop demo.
