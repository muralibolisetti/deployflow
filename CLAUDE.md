@AGENTS.md

# DeployFlow

DeployFlow is a college project: a separately branded dashboard over an unmodified Argo CD backend, run on one local Kind cluster. This is an academic adaptation of Argo CD, not an official Argo Project product.

`AGENTS.md` above is upstream's policy for pull requests to `argoproj/argo-cd`. This fork never opens those, so it doesn't apply to DeployFlow work. The project rules below do.

## Project rules

- `origin` is `muralibolisetti/deployflow`. `upstream` is `argoproj/argo-cd` and its push URL is `DISABLED`. Never push upstream.
- Work on branch `deployflow-dev`, based on tag `v3.5.6`.
- Keep Argo CD backend logic in Argo CD. Use its API instead of re-implementing features.
- Don't delete upstream directories to shrink the repo. Exclude features from scope instead.
- Don't expose admin credentials or tokens in browser code. Don't commit secrets; the fork is public.
- Don't fake functionality with mock data. Explain limitations instead.
- Don't mark a feature complete until it has been tested.
- Keep `LICENSE` and upstream attribution intact.

## Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-11-02 | Repo lives in WSL `Ubuntu` at `~/deployflow` | Chosen by the project owner |
| 2026-11-02 | Pin Argo CD `v3.5.6`, commit `c2b1e3017` | Latest stable release at start; source and manifests match. To be confirmed by the Phase 4 baseline |
| 2026-11-02 | No upstream Go or UI build planned | Published images are enough for the baseline |

Frontend architecture is not decided yet; that happens in Phase 5.

## Progress

Status values: Not started, In progress, Blocked, Completed, Tested.

| Phase | Status | Notes |
|---|---|---|
| 1. GitHub and project setup | Completed | |
| 2. Repository analysis | Completed | See `docs/architecture.md` |
| 3. Environment preparation | Not started | |
| 4. Run Argo CD baseline | Not started | |
| 5. Design DeployFlow architecture | Not started | |
| 6. Implement custom interface | Not started | |
| 7. Integrate core functionality | Not started | |
| 8. Demonstration application | Not started | |
| 9. Testing | Not started | |
| 10. Final preparation | Not started | |

## Known issues

None yet. Items still to confirm at runtime are listed in `docs/architecture.md`, section 8.
