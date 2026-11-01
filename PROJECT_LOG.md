# DeployFlow project log

The running record of what changed and why. Newest entries go at the bottom of each section.

- **Decisions** explains each choice and what else was considered.
- **Changes** lists everything changed, in the repo and outside it.
- **Issues** records problems found and how they were resolved.
- Test results are in [docs/testing.md](docs/testing.md).
- Current phase status is in [CLAUDE.md](CLAUDE.md).

## Decisions

| # | Date | Decision | Alternatives considered | Why | Decided by |
|---|---|---|---|---|---|
| 1 | 2026-11-02 | Fork as `muralibolisetti/deployflow`, public | None available: forks of public repos are always public | Brief requires a fork | Owner |
| 2 | 2026-11-02 | Keep the repo in WSL `Ubuntu` at `~/deployflow` | `C:\dev\deployflow` (recommended at the time) | Matches the brief; supports symlinks | Owner |
| 3 | 2026-11-02 | Pin Argo CD `v3.5.6`, commit `c2b1e3017` | v3.4.x, v3.3.x, `master` | Latest stable release; source and manifests match | Claude |
| 4 | 2026-11-02 | Push from WSL through the Windows `gh` login | Windows Credential Manager, new SSH key, new token | No secret stored in WSL and no interactive prompt | Claude |
| 5 | 2026-11-02 | Set the `upstream` push URL to `DISABLED` | Rely on care alone | Enforces "never push upstream" in Git itself | Claude |
| 6 | 2026-11-02 | Create branch `deployflow-dev` from the `v3.5.6` tag | Branch from `master` | Source matches the installed release | Claude |
| 7 | 2026-11-02 | Keep the `@AGENTS.md` line and add project notes to `CLAUDE.md` | Replace the file | Additive, and keeps upstream content | Claude |
| 8 | 2026-11-02 | Run cluster tools on Windows; keep the repo in WSL | Turn on Docker Desktop WSL integration | Windows tools already work, and no Docker settings change is needed | Claude |
| 9 | 2026-11-02 | Use Docker Desktop's Kubernetes (`v1.36.1`) instead of a separate Kind cluster | Debug and run a separate `kind` v1.37 cluster | It was already running and is Kind-based. It matches Argo CD's client libraries (0.36.1), and two clusters would waste RAM. **Differs from the brief's "Kind cluster"** | Claude |
| 10 | 2026-11-02 | Enable `server.insecure` on the local cluster only | User opens HTTPS in Brave; terminal-only testing | The Browser pane rejects the self-signed certificate. Reachable only through a port-forward on `127.0.0.1` | Owner |
| 11 | 2026-11-02 | Sample app in its own public repo, `muralibolisetti/student-portal` | Folder inside the DeployFlow repo | Brief asks to keep the two roles separate. Public, so Argo CD needs no credentials | Claude |
| 12 | 2026-11-02 | Local sample-app clone at `~/student-portal` in WSL | `C:\dev\student-portal` | Access to `C:\dev` was denied in this session | Claude |
| 13 | 2026-11-02 | Keep the standard 7-workload install running | Leave optional components scaled to 0 | Scaling down saves only about 170 MB and the brief asks for the standard install | Claude |
| 14 | 2026-11-02 | Leave `student-portal` on manual sync after testing | Leave auto-sync on | Manual sync is needed for the drift and rollback demos | Claude |
| 15 | 2026-11-02 | Customise the built-in UI and remove Argo branding | Separate new frontend (Claude's recommendation) | Keeps every existing screen working and is simpler to finish | Owner |
| 16 | 2026-11-02 | Serve the customised UI from a small nginx container; leave `argocd-server` unmodified | Rebuild the whole Argo CD image with Go | The UI is embedded in the server binary. nginx avoids a Go build, keeps the backend untouched, and gives one origin, which also solves the CORS finding (D1) | Claude |
| 17 | 2026-11-02 | Put the theme in one file loaded after upstream styles | Edit 49 upstream SCSS files | One place to maintain, and upstream files stay close to the original | Claude |
| 18 | 2026-11-02 | Plain visual style: warm neutrals, one pine-green accent, system font, thin borders, no mascot | Dark gradients, glass effects | Owner asked for a natural look. Inspired by Vercel (neutral surfaces), GitHub (commit-focused status) and Linear (compact sidebar) | Claude |
| 19 | 2026-11-02 | Add a small overview panel above the application list | Separate dashboard route; use upstream's summary chart | Brief requires totals and recent deployments. It reads its own data because the list view omits history | Claude |
| 20 | 2026-11-02 | Remove ApplicationSets, CLI download and API docs links from the UI, but keep their code and routes | Delete the code | Excluded from scope, and the brief says not to delete upstream components | Claude |
| 21 | 2026-11-02 | Show the failed last deployment in the overview, from `operationState` | Fake a status per history row | Answers issue 5 honestly: history itself only stores successes | Claude |
| 22 | 2026-11-02 | Restart `student-portal` pods on each release with a `release` annotation | Wait for the ConfigMap lag | The lag made a good sync look broken during a demo | Claude |
| 23 | 2026-11-02 | Stream the Docker build context from WSL as a tar file | Move the repo to Windows; turn on WSL integration | `ui/tsconfig.json` is a symlink, which Docker cannot read over `\\wsl.localhost` | Claude |

## Changes

Everything changed so far. No Argo CD source code has been modified.

### DeployFlow repository

| Date | Commit | What changed |
|---|---|---|
| 2026-11-02 | `1082d499d` | Added `docs/architecture.md`; extended `CLAUDE.md` |
| 2026-11-02 | `c93c9b9b9` | Added `PROJECT_LOG.md`, `docs/testing.md`, `docs/setup.md`, `docs/evidence/` and `deploy/local/argocd-server-insecure.patch.yaml`; updated `docs/architecture.md` and `CLAUDE.md` |
| 2026-11-02 | Final DeployFlow commits | The customised UI, nginx and deployment files, `NOTICE`, README, demo, testing, viva and presentation guides, and the progress report |

### student-portal repository

| Date | Commit | What changed |
|---|---|---|
| 2026-11-02 | `bf91eb3` | Added manifests and README: page v1 |
| 2026-11-02 | `4354208` | Page release v2. Missing the Claude co-author line |
| 2026-11-02 | `0adc23e` | Deliberately invalid `replicas: "two"`, for the failure test |
| 2026-11-02 | `9a17c47` | Reverted `0adc23e` |
| 2026-11-02 | `f240df7` | Page release v3 |
| 2026-11-02 | `341e01a` | Added the `release` annotation and `release.sh` |
| 2026-11-02 | Later commits | Test releases v4, v5 and v6, plus a second invalid-replicas test and its revert |

### GitHub

| Date | What changed |
|---|---|
| 2026-11-02 | Created the fork `muralibolisetti/deployflow` |
| 2026-11-02 | Pushed branch `deployflow-dev` |
| 2026-11-02 | Created the public repository `muralibolisetti/student-portal` |

### This computer

| Date | Where | What changed |
|---|---|---|
| 2026-11-02 | WSL `Ubuntu` | Cloned `~/deployflow`; created `~/student-portal` |
| 2026-11-02 | Both repos' `.git/config` | Repo-local name, email and credential helper. In `deployflow`, also added `upstream` with pushes blocked |
| 2026-11-02 | Windows | Installed `kind` v0.33.0 with winget. Currently unused; `winget uninstall Kubernetes.kind` removes it |
| 2026-11-02 | Docker Desktop | The owner enabled Kubernetes. Docker Desktop reports cluster type `kind`, so decision 9 still meets the brief's Kind requirement |

### Kubernetes cluster

| Date | What changed |
|---|---|
| 2026-11-02 | Created namespace `argocd` and installed Argo CD `v3.5.6` from the pinned manifest |
| 2026-11-02 | Set `server.insecure: "true"` in `argocd-cmd-params-cm`; restarted `argocd-server` |
| 2026-11-02 | Connected the `student-portal` repository |
| 2026-11-02 | Created Application `student-portal`, which created the `student-portal` namespace |
| 2026-11-02 | Temporarily enabled auto-sync and self-heal; removed afterwards |
| 2026-11-02 | Temporarily scaled three optional components to 0; restored to 1 |
| 2026-11-02 | Loaded image `deployflow-ui:0.1.0` into the node and deployed `deployflow-ui` in namespace `argocd` |

## Methods and tools

How each kind of work was done.

| Work | Method | Tools |
|---|---|---|
| Repository setup | Forked, cloned, set remotes, branched from the release tag | GitHub CLI `gh`, Git |
| Source audit | Traced code paths for each demo feature and recorded file and line references | Read and search of the source, GitHub API |
| Environment checks | Inspected versions, memory, disk and Docker state before installing anything | PowerShell, Bash, `wsl`, Docker CLI |
| Cluster | Docker Desktop's Kubernetes, type kind | Docker Desktop, `kubectl` |
| Engine install | Applied the pinned `manifests/install.yaml` | `kubectl apply --server-side` |
| UI changes | Edited upstream React and SCSS files, and added a theme stylesheet and a new component | TypeScript, SCSS, Claude Code file editing |
| Bulk rename | Replaced visible "Argo CD" text in UI sources, then searched for what remained | `sed`, `grep` |
| Build | Multi-stage image: Node compiles the UI, nginx serves it | Docker, pnpm, webpack, `tsc` |
| Image delivery | Saved the image and imported it directly into the cluster node's containerd | `docker save`, `ctr images import` |
| Sample app | Separate repo, plain YAML manifests, a release script | Git, GitHub, Bash |
| Live UI testing | Clicked through real screens | In-app Browser pane |
| Scripted testing | 28 checks through DeployFlow's address, with timings | Bash, `curl`, `kubectl`, Node.js |
| Desktop visibility | Terminal pane for commands, Browser pane for the UI, Docker Desktop for Kubernetes | Terminal tabs, computer use |
| Diagnosis | Read logs, events and network requests, then confirmed causes in the source | `kubectl logs`, browser network log, console log |
| Evidence | Saved screenshots and test output into the repo | `docs/evidence/` |
| Documentation | Markdown in the repo, updated at each milestone | Git |

## Build timeline

The steps taken, in order.

1. Checked GitHub login, tools, memory, disk, WSL and Docker.
2. Forked Argo CD as `deployflow`, cloned it into WSL and blocked pushes to upstream.
3. Created `deployflow-dev` from `v3.5.6` and verified the commit against upstream.
4. Audited the source and wrote `docs/architecture.md`.
5. Installed Kind, and diagnosed the failed cluster start.
6. Used Docker Desktop's Kubernetes and installed Argo CD.
7. Enabled plain HTTP locally with the owner's approval, and signed in.
8. Created the `student-portal` repo, then deployed and tested it on the built-in UI.
9. Recorded results in `docs/testing.md`.
10. Received the decision to customise the built-in UI and remove Argo branding.
11. Chose nginx serving so the backend stays unmodified.
12. Rebranded the UI, wrote the theme and added the overview panel.
13. Built the image, fixed the symlink failure and deployed `deployflow-ui`.
14. Reviewed every screen, then fixed the problems found.
15. Added the pod-restart fix and `release.sh` to the sample app.
16. Added the reconnecting start script.
17. Retested everything through DeployFlow.
18. Found and corrected the Git polling timing.
19. Ran upstream's UI unit tests against the changes.
20. Clicked through the demo guide's steps on real screens and corrected the labels.
21. Wrote the demo guide, manual test guide, viva notes, presentation outline, README and report.
22. Committed, pushed and verified everything on GitHub.

## Issues

| # | Date | Issue | Cause | Status |
|---|---|---|---|---|
| 1 | 2026-11-02 | `kind create cluster` failed: API server connection refused | Unconfirmed. Node `v1.37.0`, with only 0.3 GB of Windows RAM free. Kind removed the node, so its logs were lost | Bypassed by decision 9 |
| 2 | 2026-11-02 | Browser pane refused `https://localhost:8080` | Self-signed certificate | Resolved by decision 10 |
| 3 | 2026-11-02 | Open Argo CD page showed stale status | Upstream UI drops its live stream while the page is hidden. Not a bug | Explained; see [testing notes](docs/testing.md#notes-for-deployflow) |
| 4 | 2026-11-02 | Page kept showing the old release after a successful sync | Kubernetes takes 37 to 85 s to update mounted ConfigMaps | Open: fix `student-portal` in Phase 8 |
| 5 | 2026-11-02 | The brief's per-entry "previous deployment status" is not available | Argo CD history records only successes and has no status field | Resolved by decision 21: the overview shows the latest failure |
| 6 | 2026-11-02 | First Docker build failed: `invalid file request tsconfig.json` | `ui/tsconfig.json` is a symlink, unreadable over `\\wsl.localhost` | Resolved by decision 23 |
| 7 | 2026-11-02 | Automatic deploy test failed its 240 s limit | The repo server caches Git lookups for 3 minutes (`reposerver/cache/cache.go:70`), added to the 2 to 3 minute poll. The earlier 125 s result was lucky timing, and the docs were too optimistic | Rerun with a 7 minute limit passed in 214 s; docs corrected |
| 8 | 2026-11-02 | The test script's error text was blank for two rows | A Windows `curl` couldn't write to Git Bash's `/tmp`. Status codes were still real | Test tool issue, not a product issue |
| 9 | 2026-11-02 | Port-forward breaks whenever a pod restarts | `kubectl port-forward` binds to one pod | Resolved by `deploy/local/start-deployflow.ps1`, which reconnects |
| 10 | 2026-11-02 | First DeployFlow build had invisible login fields and black sidebar filters | Upstream dark sidebar styles and a removed field rule | Fixed in the theme |
| 11 | 2026-11-02 | Drift went unnoticed for over 30 seconds | One comparison took 37.5 s and logged `failed to get repo objects` while the UI unit tests were running. The exact cause isn't confirmed. GitHub was reachable, and it recovered by itself | Avoid heavy jobs during the demo; noted in the demo guide |
| 12 | 2026-11-02 | Auto-sync off appeared not to work | Navigating away right after clicking OK cancelled the request. A repeat, staying on the page, worked | Guide says to stay on the page until Sync Policy says `NONE` |
| 13 | 2026-11-02 | The demo guide described auto-sync as buttons | They are checkboxes, and Self Heal only appears after auto-sync is on | Guide corrected after clicking through it |
