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

## Changes

Everything changed so far. No Argo CD source code has been modified.

### DeployFlow repository

| Date | Commit | What changed |
|---|---|---|
| 2026-11-02 | `1082d499d` | Added `docs/architecture.md`; extended `CLAUDE.md` |
| 2026-11-02 | This commit | Added `PROJECT_LOG.md`, `docs/testing.md`, `docs/setup.md`, `docs/evidence/` and `deploy/local/argocd-server-insecure.patch.yaml`; updated `docs/architecture.md` and `CLAUDE.md` |

### student-portal repository

| Date | Commit | What changed |
|---|---|---|
| 2026-11-02 | `bf91eb3` | Added manifests and README: page v1 |
| 2026-11-02 | `4354208` | Page release v2. Missing the Claude co-author line |
| 2026-11-02 | `0adc23e` | Deliberately invalid `replicas: "two"`, for the failure test |
| 2026-11-02 | `9a17c47` | Reverted `0adc23e` |
| 2026-11-02 | `f240df7` | Page release v3 |

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
| 2026-11-02 | Docker Desktop | Kubernetes was switched on at 02:08 local time. **This was not done by Claude**; the owner should confirm |

### Kubernetes cluster

| Date | What changed |
|---|---|
| 2026-11-02 | Created namespace `argocd` and installed Argo CD `v3.5.6` from the pinned manifest |
| 2026-11-02 | Set `server.insecure: "true"` in `argocd-cmd-params-cm`; restarted `argocd-server` |
| 2026-11-02 | Connected the `student-portal` repository |
| 2026-11-02 | Created Application `student-portal`, which created the `student-portal` namespace |
| 2026-11-02 | Temporarily enabled auto-sync and self-heal; removed afterwards |
| 2026-11-02 | Temporarily scaled three optional components to 0; restored to 1 |

## Issues

| # | Date | Issue | Cause | Status |
|---|---|---|---|---|
| 1 | 2026-11-02 | `kind create cluster` failed: API server connection refused | Unconfirmed. Node `v1.37.0`, with only 0.3 GB of Windows RAM free. Kind removed the node, so its logs were lost | Bypassed by decision 9 |
| 2 | 2026-11-02 | Browser pane refused `https://localhost:8080` | Self-signed certificate | Resolved by decision 10 |
| 3 | 2026-11-02 | Open Argo CD page showed stale status | Upstream UI drops its live stream while the page is hidden. Not a bug | Explained; see [testing notes](docs/testing.md#notes-for-deployflow) |
| 4 | 2026-11-02 | Page kept showing the old release after a successful sync | Kubernetes takes 37 to 85 s to update mounted ConfigMaps | Open: fix `student-portal` in Phase 8 |
| 5 | 2026-11-02 | The brief's per-entry "previous deployment status" is not available | Argo CD history records only successes and has no status field | Open: decide in Phase 5 |
