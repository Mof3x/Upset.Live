# Git cheat sheet (website management flow)

## Setup (once)
- Check Git is installed:
- `git --version`

- Configure identity:
- `git config --global user.name "Your Name"`
- `git config --global user.email "you@email.com"`

- Prefer `main` as default branch:
- `git config --global init.defaultBranch main`

## Get the site locally
- Clone:
- `git clone https://github.com/ORG/SITE-REPO.git`
- Enter folder:
- `cd SITE-REPO`

- First-time dependencies (if applicable):
- `npm install`

## Daily workflow (edit → test → commit → push)
### 1) Sync before you start
- `git switch main`
- `git pull --rebase`

### 2) Create a branch for your change
- `git switch -c feature/short-description`

Examples:
- `git switch -c fix/nav-dropdown`
- `git switch -c content/update-homepage-copy`

### 3) Make changes + preview locally
Common local dev commands:
- `npm run dev`
- `npm test`
- `npm run build`

### 4) Check what changed
- Status summary:
- `git status`

- See line-by-line changes:
- `git diff`

- See what you’re about to commit (staged):
- `git diff --staged`

### 5) Stage changes
- Stage specific files:
- `git add path/to/file`

- Stage everything:
- `git add .`

- Unstage something:
- `git restore --staged path/to/file`

### 6) Commit
- `git commit -m "Fix mobile header spacing"`

If you need to edit the last commit message:
- `git commit --amend`

### 7) Push your branch
- `git push -u origin feature/short-description`

### 8) Open a PR / Merge Request
- Open PR to `main`
- Let CI run (tests/build)
- Get review
- Merge when approved

## After PR merge (update your local)
- `git switch main`
- `git pull --rebase`

- Delete local branch:
- `git branch -d feature/short-description`

- Delete remote branch (optional; many hosts do it automatically):
- `git push origin --delete feature/short-description`

## Hotfix / urgent production change
- `git switch main`
- `git pull --rebase`
- `git switch -c hotfix/issue`
- Edit + test
- `git add .`
- `git commit -m "Hotfix: ..."`
- `git push -u origin hotfix/issue`
- Open PR to `main` and merge ASAP

## Deployments (common patterns)
### Option A: Host auto-deploys on merge to `main` (recommended)
- Merge PR → deploy triggers automatically
- To check what’s deployed:
- `git log --oneline --decorate -10`

### Option B: Deploy branch (e.g., `production` / `gh-pages`)
- Update `main` as normal
- Merge `main` into `production`, or push build output depending on setup

(If you tell me your host—Netlify/Vercel/GitHub Pages—and whether you deploy on `main`, I can tailor this section.)

## Fixing mistakes
### Discard local changes (not committed)
- Discard changes in one file:
- `git restore path/to/file`

- Discard all local changes:
- `git restore .`

### Pull went wrong (rebase)
- Abort rebase:
- `git rebase --abort`

### Undo a commit (already pushed) safely
- Make a “revert” commit:
- `git revert <commit-hash>`
- `git push`

### Move/rename files (keeps history)
- `git mv old/path new/path`
- `git commit -m "Move ..."`

## Useful inspection commands
- Commit history:
- `git log --oneline --graph --decorate --all -20`

- See which branch you’re on:
- `git branch`

- See remotes:
- `git remote -v`

- Show what changed in a commit:
- `git show <commit-hash>`

## Suggested conventions for website repos
- Branch names:
- `feature/...`, `fix/...`, `content/...`, `chore/...`, `hotfix/...`

- Commit message style:
- `Add ...`, `Fix ...`, `Update ...`, `Refactor ...`

---

If you want, tell me:
- your deployment host (Netlify/Vercel/GitHub Pages/etc.)
- whether there’s a staging environment
- whether non-devs edit content (e.g., Markdown/CMS)

…and I’ll tailor the cheat sheet into a tighter “exact commands we use here” flow.