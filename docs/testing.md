# Testing report

**Date:** 2026-11-02
**System under test:** upstream Argo CD `v3.5.6` and its built-in web UI, on Docker Desktop Kubernetes `v1.36.1`, deploying the `student-portal` sample.

> **What this report covers:** the DeployFlow dashboard does not exist yet (Phases 5 to 7). These tests prove the backend features DeployFlow will rely on. They must be repeated through DeployFlow once it is built. Passing here does not mean DeployFlow is complete.

## Summary

| Group | Passed | Failed |
|---|---|---|
| Required tests | 10 | 0 |
| Optional tests | 4 | 0 |
| Audit predictions checked | 11 | 0 |

## Required tests

| # | Objective | Steps | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|---|
| 1 | Connect a Git repository | Settings, Connect Repo, HTTPS, enter URL | Connection tested and saved | Status `Successful` | Pass | [Screenshot](evidence/01-repo-connected.jpg) |
| 2 | List an application | New App form, Create | App listed, compared with Git | `OutOfSync` / `Missing` at `bf91eb3`; 3 resources listed; `kubectl` showed nothing deployed | Pass | `kubectl get application` |
| 3 | Initial deployment | Sync, Synchronize | Resources created and running | `Synced` / `Healthy`, 2/2 pods, page served `v1`. Health showed `Progressing` until pods were ready | Pass | [Screenshot](evidence/03-first-sync.jpg) |
| 4 | Detect drift | `kubectl scale --replicas=5` | App becomes `OutOfSync` | `OutOfSync` in **0.6 s**. Only the Deployment was flagged | Pass | [Diff, 5 vs 2](evidence/04-drift-diff.jpg) |
| 5 | Manual sync fixes drift | View diff, Sync | Replicas return to Git's value | 5 returned to 2, `Synced` | Pass | `kubectl get deploy` |
| 6 | Resource status | Open app details | Resources and health shown | Tree showed ConfigMap, Service, Deployment, ReplicaSet and pods with health and status | Pass | Resource tree, app details page |
| 7 | Update through Git | Push v2, Refresh, Sync | Git change reaches the running app | Refresh found `4354208` in about **5 s**. Page changed to v2 about **37 s** after sync | Pass | [Screenshot](evidence/06-release-v2.jpg) |
| 8 | History and rollback | History, Rollback to `bf91eb3`, OK | Previous version restored | Page back to v1 after about **40 s**. New history entry added. Git unchanged. App showed `OutOfSync` | Pass | [Screenshot](evidence/07-after-rollback.jpg) |
| 9 | Error handling | (a) Connect a missing repo (b) Push `replicas: "two"`, Sync | Clear errors, running app unharmed | (a) "Repository not found", nothing saved (b) `Sync failed`, old pods kept serving v2 | Pass | [(a)](evidence/09a-repo-error.jpg), [(b)](evidence/09b-sync-failed.jpg) |
| 10 | Refresh and state consistency | Compare API, `kubectl` and reloaded page | All agree | All agreed. An open page stopped updating while hidden; see [note 1](#notes-for-deployflow) | Pass | Network log, API responses |

## Optional tests

| # | Objective | Steps | Expected | Actual | Result |
|---|---|---|---|---|---|
| O1 | Self-healing | Enable auto-sync and self-heal, scale to 5 | Restored with no action | Back to 2 in **1.5 s**, initiated by `automated` | Pass |
| O2 | Rollback blocked under auto-sync | `POST /rollback` | Refused | HTTP `400`: "rollback cannot be initiated when auto-sync is enabled" | Pass |
| O3 | Automated sync from Git | Push v3, touch nothing | Found and deployed by polling | Deployed **125 s** after push. Page later showed v3 | Pass |
| O4 | Run without optional components | Scale Dex, notifications and ApplicationSet to 0, repeat drift test | Core features keep working | Drift found in 0.4 s; saved about 170 MB. Components restored | Pass |

Login was also exercised throughout: UI sign-in worked, and an unauthenticated `GET /api/v1/applications` returned `401`.

## Audit predictions checked at runtime

| Finding | Prediction | Outcome |
|---|---|---|
| D1 | No CORS headers for another origin | Confirmed: none returned for `Origin: http://localhost:5173` |
| D4 | Sync response does not show the result | Confirmed: HTTP `200` for a sync that then failed |
| D5 | `?refresh=normal` waits for reconciliation | Confirmed: returned the new revision |
| D7 | Failed syncs are not in history | Confirmed: no entry added |
| D8 | Each sync adds a history entry | Confirmed: same commit appears in more than one entry |
| D9 | Rollback refused under auto-sync | Confirmed: HTTP `400` |
| S1 | Explicit `replicas` shows drift | Confirmed |
| S2 | App shows `OutOfSync` after rollback | Confirmed |
| S3 | Git changes need Refresh or polling | Confirmed: `Synced` on the old commit until refreshed |
| S4 | Self-heal adds no history entry | Confirmed: history unchanged |
| Section 8 item 1 | Optional components can be off | Confirmed |

## Measurements

| Measure | Result |
|---|---|
| Drift detection | 0.4 to 0.6 s |
| Self-heal | 1.5 s |
| Manual Refresh | About 5 s |
| Auto-deploy after a Git push | 125 s |
| ConfigMap reaching running pods | 37 to 85 s after sync |
| Memory: cluster, Argo CD and app | 1.9 GiB (1.74 GiB with optional components off) |

## Notes for DeployFlow

1. **Hidden pages stop updating by design.** Argo CD's UI drops its live stream while `document.hidden` is true (`ui/src/app/applications/components/utils.tsx:1745-1755`). The stream itself worked and delivered an event in 40 ms. DeployFlow should reload state when a page becomes visible again.
2. **ConfigMap changes lag behind a successful sync.** Mounted files update on the kubelet's schedule, and the lag varied from 37 to 85 s. The page looked wrong even though the sync had succeeded. In Phase 8, `student-portal` should also change a pod-template annotation with each release so that pods restart at once. Until then, the demo must allow for the lag.
3. **A failed sync still returns HTTP `200`.** Use `status.operationState.phase` for the result.
4. **A failed repository connection returns HTTP `500`.** The readable message is in the response body.

## Not yet tested

- Anything in the DeployFlow dashboard, because it has not been built.
- Serving a dashboard from `/shared/app`.
- A `Degraded` application, such as a bad image.
- Rebuilding the whole environment from `docs/setup.md`.
- Testing on the Kind cluster originally planned. See decision 9 in [PROJECT_LOG.md](../PROJECT_LOG.md).
