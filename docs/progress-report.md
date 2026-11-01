# Progress report

**Project:** DeployFlow, a simplified GitOps-based Kubernetes application deployment and management platform
**Date:** 2026-11-02
**Repositories:** [muralibolisetti/deployflow](https://github.com/muralibolisetti/deployflow/tree/deployflow-dev), branch `deployflow-dev`, and [muralibolisetti/student-portal](https://github.com/muralibolisetti/student-portal)

## Summary

DeployFlow is built, running and tested on the local cluster. It's a rebranded, customised version of Argo CD's web interface, served by nginx in front of an unmodified Argo CD backend. All eight required features work through the DeployFlow interface.

What remains is for you: rehearse the demo and prepare the slides.

## Phase status

| Phase | Status | Result | Where |
|---|---|---|---|
| 1. GitHub and project setup | Completed | Fork, clone, remotes, dev branch | [PROJECT_LOG.md](../PROJECT_LOG.md) |
| 2. Repository analysis | Completed | Architecture and source map | [architecture.md](architecture.md) |
| 3. Environment preparation | Completed | Docker Desktop Kubernetes | [setup.md](setup.md) |
| 4. Run Argo CD baseline | Tested | Argo CD `v3.5.6` running | [testing.md](testing.md) |
| 5. Design architecture | Completed | Customised UI behind nginx | [architecture.md](architecture.md) |
| 6. Custom interface | Tested | Rebrand, theme, overview panel | [customizations.md](customizations.md) |
| 7. Core functionality | Tested | All features through DeployFlow | [testing.md](testing.md) |
| 8. Demonstration application | Tested | `student-portal` repo | [student-portal](https://github.com/muralibolisetti/student-portal) |
| 9. Testing | Tested | 28 checks, 263 unit tests | [testing.md](testing.md) |
| 10. Final preparation | Completed | Docs finished; rehearsal is yours to do | [demo-guide.md](demo-guide.md) |

## Required features

| Feature | Status |
|---|---|
| Git repository connection | Tested |
| Application dashboard | Tested |
| Deployment to Kubernetes | Tested |
| OutOfSync detection | Tested |
| Manual synchronization | Tested |
| Health and resource status | Tested |
| Deployment history | Tested, with one limitation below |
| Basic rollback | Tested |
| Custom branding and interface | Tested |

Optional features also work: automated sync, self-healing and polling from Git.

## What was built

| Item | Description |
|---|---|
| Rebranded interface | New name, logo, login page, sidebar, navigation, colours and wording |
| Overview panel | New: four counts plus recent deployments, including the latest failure |
| nginx serving | One address for the UI and API, with the backend unmodified |
| Sample application | Separate repo with Deployment, Service, ConfigMap, two replicas and a release script |
| Start script | One command that opens reconnecting connections and both pages |
| Documentation | Everything listed below |

No Argo CD Go backend code was changed. See [customizations.md](customizations.md).

## Key results

| Measure | Result |
|---|---|
| Scripted checks | 27 of 28 passed; the failure passed on rerun with a longer limit |
| Upstream UI unit tests | 263 passed |
| Drift detection | Under 1 second |
| Page update after sync | About 4 seconds |
| Self-heal | 1.5 seconds |
| Memory use | About 1.8 GiB |

## Key decisions

The full list of 23, with alternatives and reasons, is in [PROJECT_LOG.md](../PROJECT_LOG.md).

| Decision | Why | Decided by |
|---|---|---|
| Keep the repo in WSL | Your choice, matching the brief | You |
| Customise the built-in UI | Simpler, and every screen keeps working | You |
| Plain HTTP on the local cluster | Needed for the in-app browser; local only | You |
| Use Docker Desktop's Kubernetes | Already kind-based, and matches Argo CD's versions | Claude |
| Serve the UI from nginx | No Go build, backend unmodified, no CORS problem | Claude |
| Plain visual style | Natural look, inspired by Vercel, GitHub and Linear | Claude |

## Problems solved

| Problem | Resolution |
|---|---|
| Kind cluster failed to start | Used Docker Desktop's kind-based cluster. The original cause wasn't confirmed |
| Self-signed certificate blocked | Plain HTTP locally, with your approval |
| Argo CD has no CORS support | One origin through nginx |
| Docker couldn't read a symlink over the WSL path | Streamed the build context from inside WSL |
| Page took 37 to 85 seconds to change | Pods restart on each release, now about 4 seconds |
| Port-forward broke on pod restart | Start script reconnects automatically |
| Git polling slower than documented | Measured, then docs corrected |
| Guide described the wrong auto-sync controls | Clicked through the steps, then corrected them |

## Limitations

- **History shows only successful deployments.** The brief's "previous deployment status" isn't available per entry. The overview shows the latest failure instead.
- **Some of the brief was adapted.** It preferred a separate frontend and a plain Kind cluster. You chose the built-in UI, and the cluster is Docker Desktop's kind-based one.
- **The name Argo isn't removed everywhere.** The running app no longer credits it, but it remains in `NOTICE`, the README attribution, the docs, two upstream help links, and technical names like the `argocd` namespace. The notices stay because the licence requires them and the project is being assessed.
- **Local demonstration only.** It uses plain HTTP inside the cluster, one admin account and no public access.
- **The login API still returns its token in the response body** as well as the cookie. The UI uses only the cookie.
- **Not tested:** see the list at the end of [testing.md](testing.md), including a from-scratch install and a full timed rehearsal.

## What you need to do

1. **Change nothing on the day.** Keep auto-sync off, and don't run builds during the demo.
2. **Rehearse** with [demo-guide.md](demo-guide.md) at least once, timing it.
3. **Try the tests yourself** with [manual-testing.md](manual-testing.md).
4. **Read** [viva-preparation.md](viva-preparation.md), and open the source files it mentions.
5. **Make your slides** from [presentation-outline.md](presentation-outline.md). Slides were not created.
6. **Check your name and course** in `NOTICE` and on your title slide. `NOTICE` uses your GitHub username.

## Where everything is

| Need | File |
|---|---|
| Install and start | [setup.md](setup.md) |
| Run the panel demo | [demo-guide.md](demo-guide.md) |
| Test each feature by hand | [manual-testing.md](manual-testing.md) |
| Test results and evidence | [testing.md](testing.md), `docs/evidence/` |
| How the system works | [architecture.md](architecture.md) |
| What changed from upstream | [customizations.md](customizations.md) |
| Likely viva questions | [viva-preparation.md](viva-preparation.md) |
| Slide plan | [presentation-outline.md](presentation-outline.md) |
| Every decision, change, tool, step and issue | [PROJECT_LOG.md](../PROJECT_LOG.md) |
| Project rules and status | [CLAUDE.md](../CLAUDE.md) |
