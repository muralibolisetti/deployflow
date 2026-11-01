# Testing report

**Date:** 2026-11-02
**System under test:** DeployFlow `0.1.0` on Argo CD `v3.5.6`, Docker Desktop Kubernetes `v1.36.1`, with the `student-portal` sample.

Testing happened in two rounds. The first used the unmodified Argo CD UI to prove the backend. The second repeated the work through DeployFlow, across its nginx layer, which is what this report records.

## Summary

| Group | Result |
|---|---|
| Scripted checks through DeployFlow | 28 checks: 27 passed, 1 failed its time limit, then passed on rerun |
| Clicked through in the real interface | Sign-in, overview, sync, diff, auto-sync on and off, self-heal, history, rollback |
| Upstream UI unit tests | 263 passed in 24 suites, with 32 snapshots |
| TypeScript check | Passed |
| Audit predictions checked | All confirmed, one timing corrected |

Raw output: [retest-output.txt](evidence/retest-output.txt) and [autodeploy-output.txt](evidence/autodeploy-output.txt).

## Required tests

| # | Objective | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|
| 1 | Sign in | Correct and wrong password, then no session | Only the correct password works | Session created; wrong password and no session both `401` | Pass |
| 2 | Connect a Git repository | Check the connected repo; try a missing one | Repo connected; missing one refused | `Successful`; missing repo refused with HTTP `500` and a clear error in the UI | Pass |
| 3 | Application listing | Overview and list | Real data | `student-portal` with counts and recent deployments | Pass |
| 4 | Deployment | Sync | Resources running | `Synced` / `Healthy`, new pods within seconds | Pass |
| 5 | Drift detection | `kubectl scale --replicas=5` | App becomes `OutOfSync` | `OutOfSync` in **0.9 s**, Deployment only | Pass |
| 6 | Diff | Open Diff | Shows the change | Live 5, target 2 | Pass |
| 7 | Manual sync | Sync | Replicas return to 2 | `Synced` in **3.1 s** | Pass |
| 8 | Resource status | Open the tree | Resources and health shown | ConfigMap, Service, Deployment, ReplicaSets, Pods | Pass |
| 9 | Update through Git | `release.sh v4`, Refresh, Sync | Page changes | Refresh in **1.8 s**; page on v4 **4.1 s** after sync | Pass |
| 10 | History | Open History and rollback | Past deployments listed | Commit, author, time, initiator | Pass |
| 11 | Rollback | Rollback to an older commit | Old page returns | Page back in **4.5 s**, and 5 s through the UI. App shows `OutOfSync` | Pass |
| 12 | Forward again | Sync after rollback | Latest returns | Page on latest in **6.7 s** | Pass |
| 13 | Failed deployment | Push `replicas: "two"`, Refresh, Sync | Reported clearly; app unharmed | Phase `Failed`, app kept serving v4, history unchanged, overview data shows 1 failure | Pass |
| 14 | Recovery | Revert the bad commit, Sync | Healthy again | `Synced` / `Healthy` | Pass |
| 15 | State consistency | Compare API, `kubectl` and the page | All agree | Agreed once the page was visible; see note 1 | Pass |

## Optional tests

| # | Objective | Result | Detail |
|---|---|---|---|
| O1 | Self-healing | Pass | Restored in **1.5 s**, and also when switched on through the UI |
| O2 | No history from self-heal | Pass | History unchanged |
| O3 | Rollback refused under auto-sync | Pass | HTTP `400` |
| O4 | Automatic deploy from Git | **Failed, then passed** | Timed out at my 240 s limit. Rerun with a 7 minute limit: passed in **214 s**, initiated by `automated`. The first run's limit was too short, not a product fault |
| O5 | Auto-sync off through the UI | Pass | Sync Policy shows `NONE`, and rollback then works |
| O6 | Run without optional components | Pass | Tested in round one, saving about 170 MB |

## Security and proxy checks

| Check | Result |
|---|---|
| API without sign-in | `401` |
| CORS headers for a foreign origin | None |
| "Argo CD" in the served index page | None |
| Password in saved logs and docs | None |
| Upstream Git remote | Push blocked |

## Measurements

| Measure | Result |
|---|---|
| Drift detection | Under 1 s |
| Self-heal | 1.5 s |
| Refresh | 1.8 to 5 s |
| Page update after sync | About 4 s (was 37 to 85 s before the restart fix) |
| Rollback to visible page | 4.5 to 5 s |
| Automatic deploy from Git | 125 s, 214 s, and one over 240 s. The theoretical limit is about 6 minutes |
| Memory: cluster, engine, UI and app | About 1.8 GiB |

## Findings

1. **Hidden pages stop updating by design.** The UI drops its live stream while the tab is hidden, and resumes when it's visible. The overview does the same.
2. **Heavy load can stall detection.** While the unit tests ran, one comparison took 37.5 s and logged `failed to get repo objects`, so drift went unnoticed for over 30 seconds. The exact cause isn't confirmed. GitHub was reachable, and it recovered without help. Don't run builds or tests during a demo.
3. **Successful HTTP doesn't mean a successful deployment.** A failed sync returned `200`. The real result is in `status.operationState.phase`.
4. **History holds only successful, full deployments.** The overview shows the latest failure separately.
5. **Git polling is slower than it first appears.** Lookups are cached for 3 minutes on top of the polling cycle.

## Not tested

- Installing everything from nothing using `docs/setup.md`.
- The "Reset to a fresh start" steps in the demo guide.
- A real `Degraded` application, such as a bad image.
- Dark mode after the final build. It looked fine on the first build, on the dashboard only.
- Other browsers and small screens.
- The script `release.sh` run by hand from a WSL terminal. It was run through `wsl`, which uses the same script.
- The client-side rollback warning shown when auto-sync is on. The server's refusal was tested.
- A complete timed rehearsal of the panel demo.

Tests 1 and 2 of [manual-testing.md](manual-testing.md) and the connect-repo form were clicked through on the original UI. That form wasn't changed apart from styling.
