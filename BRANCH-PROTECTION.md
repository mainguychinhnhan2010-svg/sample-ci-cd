# Branch Protection Setup

Set these rules **before** the workshop demo. These are configured in the GitHub UI, not committed as code.

## Prerequisites

- The repo must be **public** (or GitHub Team/Enterprise for private)
- You must be a repo admin

## Step-by-step

1. **Go to repo Settings**
   - Navigate to your repo on GitHub
   - Click the **Settings** tab

2. **Go to Branches**
   - In the left sidebar, click **Branches**
   - Under "Branch protection rules", click **Add branch protection rule**

3. **Configure the rule for `master`**

   | Setting | Value |
   |---|---|
   | Branch name pattern | `master` |
   | Require a pull request before merging | ✅ checked |
   | Require approvals | 1 |
   | Dismiss stale pull request approvals when new commits are pushed | ✅ checked |
   | Require status checks to pass before merging | ✅ checked |
   | Require branches to be up to date before merging | ✅ checked |

4. **Add status checks**
   - Search for and select:
     - `Unit Tests`
     - `Secret Scan`
     - `Integration Tests (Preview)`
     - `Lighthouse Audit (Preview)`
   - These names must exactly match the `name:` fields in `.github/workflows/ci-cd.yml`
   - Note: `Integration Tests (Preview)` and `Lighthouse Audit (Preview)` depend on `Deploy PR Preview`, so requiring them implicitly gates deployment too
   - The checks won't appear in the search until the workflow has run at least once — you may need to push first, then come back to add them

5. **Save**
   - Click **Create** (or **Save changes** if editing)

## Verification

After setup:
1. Create a branch: `git checkout -b test-protection`
2. Make any change, commit, and try to push directly to `master` — it should be **rejected**
3. Push your branch and open a PR — you should see the status checks appear
4. If status checks aren't listed yet, merge the PR first so the workflow runs on `master`, then they'll appear in the branch protection settings

## What this protects against

- ❌ `git push origin master` — rejected
- ❌ Merging without PR — blocked
- ❌ Merging with failing tests — blocked
- ❌ Merging stale branches — blocked
- ✅ Only reviewed, tested code reaches `master`
