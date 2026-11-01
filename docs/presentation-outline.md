# Presentation outline

A suggested structure for a 10 to 15 minute presentation, including the live demo. Use the speaker notes as prompts, not a script.

| # | Slide | Content | Time |
|---|---|---|---|
| 1 | Title | DeployFlow: a simplified GitOps deployment platform. Your name, course | 30 s |
| 2 | The problem | Manual deployments are error-prone, hard to audit, and drift over time | 1 min |
| 3 | What is GitOps? | Git as the source of truth; desired state vs actual state | 1 min |
| 4 | Objectives | The eight required features from the project brief | 30 s |
| 5 | Why build on Argo CD | Reuse a proven engine; focus on usability. State clearly what is upstream | 1 min |
| 6 | Architecture | The diagram from `docs/architecture.md`: browser, nginx, server, repo server, controller, Redis, Git | 2 min |
| 7 | What we built | The UI rebrand, overview panel, nginx serving, sample app. Before and after screenshots | 1 min |
| 8 | Live demo | Follow `docs/demo-guide.md` | 5 to 6 min |
| 9 | Testing and results | Totals, then three measurements: drift under 1 s, self-heal 1.5 s, page update about 4 s after sync | 1 min |
| 10 | Challenges | Certificate block, CORS, ConfigMap delay, symlink build error, and how each was resolved | 1 min |
| 11 | Limitations and future work | From `docs/viva-preparation.md` | 30 s |
| 12 | Conclusion | GitOps makes deployments visible, repeatable and reversible | 30 s |

## Tips

- Run the checks in `docs/demo-guide.md` before the panel arrives.
- Have screenshots from `docs/evidence/` ready in case the live demo fails.
- Close unrelated apps and notifications.
- Say "based on Argo CD" early, so nobody thinks you are claiming it as your own.
