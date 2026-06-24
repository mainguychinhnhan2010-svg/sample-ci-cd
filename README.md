# sample-ci-cd

A dead-simple Click Counter website used to demonstrate CI/CD with GitHub Actions.

Part of the **Orientation Seminar** workshop for new AI lab students.

🔗 **Production:** [mainguychinhnhan2010-svg.github.io/sample-ci-cd](https://mainguychinhnhan2010-svg.github.io/sample-ci-cd/)

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

### Pre-push hook

A [Husky](https://typicode.github.io/husky/) pre-push hook runs `npm test` before every push. If unit tests fail, the push is rejected:

```bash
git push                         # runs npm test first — blocks push if tests fail
git push --no-verify             # skip the hook (emergency escape hatch)
```

This catches broken unit tests on your machine, before they even reach CI.

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
                       ┌── deploy-preview ──→ integration-test-preview
PR opened / push ──→ unit-test                 (Cypress against preview URL)
                       └── deploy ──────────→ integration-test
                            (master only)       (Cypress against production URL)
```

- **Unit tests** (Jest) run on every push and every PR
- **Deploy** fires after unit tests pass — to `/preview/pr-<N>/` for PRs, to the root `/` for master
- **Integration tests** (Cypress) run **against the deployed URL**, not a local server — tests the real thing
- **PR comment** posts the preview URL only after all checks pass
- **Auto-cleanup:** when a PR is closed or merged, its preview directory is deleted

### Why test against the deployed URL?

Testing against `localhost` tells you the code works on the CI machine. Testing against the deployed GitHub Pages URL tells you the code works **in production**. If the page doesn't load, if the JS doesn't execute, if a path is wrong — Cypress catches it on the real URL, not a local approximation.

| Environment | Trigger | Deploys to | Tested by |
|---|---|---|---|
| **Staging** | PR opened / pushed | `/preview/pr-<N>/` | `integration-test-preview` |
| **Production** | Push to `master` | `/` (root) | `integration-test` |

## Branch protection (set in GitHub UI)

1. Go to **Settings → Branches → Add branch protection rule**
2. Set branch name pattern to `master`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Add status checks: `Unit Tests`, `Integration Tests (Preview)`

See [BRANCH-PROTECTION.md](BRANCH-PROTECTION.md) for detailed setup instructions.

## Live demo

See [DEMO-SCRIPT.md](DEMO-SCRIPT.md) for the step-by-step workshop demo.
