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
git push → [unit tests] → [integration tests] → [deploy to GitHub Pages]
              (Jest)           (Cypress)            (only on master)
```

- **Unit tests** run on every push and every PR
- **Integration tests** run after unit tests pass
- **Deploy** only fires on push to `master` (after merge), requires both to pass

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
