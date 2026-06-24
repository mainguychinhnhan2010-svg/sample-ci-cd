# sample-ci-cd

A dead-simple Click Counter website used to demonstrate CI/CD with GitHub Actions.

Part of the **Orientation Seminar** workshop for new AI lab students.

## What this is

This is a companion demo project that shows:

- **Branch protection:** `master` is locked — no direct pushes
- **Automated testing:** unit tests (Jest) + integration tests (Cypress)
- **CI/CD pipeline:** push → test → deploy to GitHub Pages
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
```

## How it works

| File | Purpose |
|---|---|
| `src/index.html` | The page — a heading, a counter, a button |
| `src/counter.js` | The logic — a pure `incrementCounter()` function + DOM wiring |
| `tests/unit/counter.test.js` | Jest tests for the pure function |
| `tests/integration/counter.cy.js` | Cypress tests for the full page |
| `.github/workflows/ci-cd.yml` | The CI/CD pipeline |

## The pipeline

```
                      ┌─→ [deploy preview]  ──→ /preview/pr-N/  (staging)
PR opened / push ─→ [unit-test] ─→ [integration-test]
                      └─→ [deploy]          ──→ /                (production, master only)
```

- **Unit tests** (Jest) run on every push and every PR
- **Integration tests** (Cypress) run after unit tests pass
- **PR preview** deploys to `/preview/pr-<number>/` — a live staging URL you can click
- **Production deploy** only fires on push to `master` (after merge), deploys to the root
- **Auto-cleanup:** when a PR is closed or merged, its preview directory is deleted

## Deployment architecture

| Environment | Trigger | URL | Purpose |
|---|---|---|---|
| **Production** | Push to `master` | `https://<user>.github.io/sample-ci-cd/` | The live site everyone sees |
| **Staging (PR preview)** | PR opened / updated | `https://<user>.github.io/sample-ci-cd/preview/pr-<N>/` | Review a change before merging |

This mirrors how real teams work: every PR gets its own live preview. Reviewers can click a link and see the change, not just read the diff. When the PR merges, the preview is cleaned up automatically.

## Branch protection (set in GitHub UI)

1. Go to **Settings → Branches → Add branch protection rule**
2. Set branch name pattern to `master`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Add status checks: `unit-test`, `integration-test`

See [BRANCH-PROTECTION.md](BRANCH-PROTECTION.md) for detailed setup instructions.

## Live demo

See [DEMO-SCRIPT.md](DEMO-SCRIPT.md) for the step-by-step workshop demo.
