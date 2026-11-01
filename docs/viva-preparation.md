# Viva preparation

Short answers to the questions a panel is likely to ask. Learn the ideas rather than the wording, and be ready to open the code.

## The project

**What is DeployFlow?**
A customised GitOps deployment dashboard. Git stores what should be running in Kubernetes. DeployFlow shows whether the cluster matches and applies changes. It is built on the open-source Argo CD.

**What did you build yourself, and what is Argo CD's?**
The backend is unmodified Argo CD. We changed the web interface: visual identity, login, navigation, wording and a new overview panel. We also created the deployment configuration and the sample app. `docs/customizations.md` lists every change.

**Why not build everything from scratch?**
GitOps needs reliable diffing, health checks and sync logic. Reusing a graduated CNCF project is sound engineering, and lets the project focus on usability and integration.

**What problem does it solve?**
Manual `kubectl` changes are hard to track and easy to forget. With GitOps, every change is a Git commit, so changes are reviewable and reversible, and drift is visible.

## GitOps concepts

**What is GitOps?**
Using Git as the single source of truth for infrastructure and applications. An automated agent makes the running system match Git.

**What is declarative configuration?**
Describing the end state, such as "two replicas", instead of the steps to reach it.

**What does OutOfSync mean?**
The live state differs from the state in Git, in either direction: the cluster changed, or Git changed.

**What is the difference between sync status and health?**
Sync compares the cluster with Git. Health says whether the resources are actually working. An app can be Synced but Degraded, or OutOfSync but Healthy. We saw the second case in our tests.

**What is drift?**
When the running system no longer matches its declared configuration, usually after a manual change.

**What is reconciliation?**
The repeating loop that compares desired and actual state and reports or corrects the difference.

## How the system works

**Name the main components.**

| Component | Job |
|---|---|
| `deployflow-ui` | nginx serving our UI and forwarding API calls |
| `argocd-server` | API, login |
| `argocd-repo-server` | Reads Git and produces manifests |
| `argocd-application-controller` | Compares state and performs syncs |
| Redis | Cache |

**Is there a database?**
No. Configuration lives in Kubernetes objects and Secrets. Redis is only a cache.

**What happens when I click Sync?**
1. The browser sends `POST /api/v1/applications/student-portal/sync`.
2. nginx forwards it to `argocd-server`.
3. The server writes an `operation` onto the `Application` object and returns immediately.
4. The controller sees it and asks the repo server for the manifests.
5. The controller applies them through gitops-engine.
6. It records history and stores the result in `status.operationState`.
7. The UI gets the update through a live stream.

**How did it detect drift in under a second?**
The controller watches the Kubernetes API, so a change triggers a comparison at once. It doesn't poll for cluster changes.

**Why does a Git change take longer?**
Git isn't watched. The engine polls every 2 to 3 minutes, and Git lookups are cached for 3 minutes, so a change can take up to about 6 minutes. We measured 125 seconds, 214 seconds, and one case over 240 seconds. Refresh checks immediately. Webhooks can make this instant, but GitHub can't reach a local cluster.

**How does rollback work?**
It looks up an earlier history entry and syncs to that commit. Rollback is "just a convenience around Sync" in the source code.

**Why is the app OutOfSync after a rollback?**
Rollback changes the cluster but not Git. Git still has the newer commit, so they differ. For a permanent fix, revert the commit in Git.

**Why is rollback blocked with auto-sync on?**
Auto-sync would immediately redeploy the latest commit, undoing the rollback.

**What is self-healing?**
With auto-sync, Argo CD also reverts manual cluster changes. Ours restored replicas in 1.5 seconds.

## Design decisions

**Why customise the UI instead of writing a new one?**
It keeps all working screens, such as the resource tree and diff viewer, and takes less effort.

**Why nginx?**
Argo CD compiles its UI into the server binary. Changing it there means rebuilding the server with Go. nginx serves our build separately and leaves the backend unmodified.

**How does the UI talk to the backend?**
Through REST and Server-Sent Events on the same address. nginx forwards `/api/` to `argocd-server`.

**What is CORS, and why does it matter here?**
Browsers block a page from calling an API on a different origin unless the API allows it. Argo CD sends no CORS headers. Serving both through nginx gives one origin, so CORS never applies.

**Why is the Sync result not in the HTTP response?**
Sync is asynchronous. A failed sync still returned HTTP `200`, so the real result must be read from `status.operationState.phase`.

**Why is there a `release` annotation on the Deployment?**
Pods read a ConfigMap as a mounted file, and Kubernetes takes time to update it. We measured 37 to 85 seconds. Changing an annotation on the pod template creates new pods, which read the new file at once.

**Why plain HTTP?**
Only inside the local demo, reached through `127.0.0.1`. Argo CD's self-signed certificate is rejected by the in-app browser. It would be wrong for production.

**Why one cluster, and which one?**
The project needs only one. Docker Desktop's Kubernetes reports cluster type `kind` and runs version 1.36.1, matching Argo CD's client libraries. A separate Kind v1.37 cluster failed to start, and two clusters would waste memory.

## Limitations

| Limitation | Why |
|---|---|
| History shows successes only | Argo CD doesn't record failures there. The overview shows the latest failure instead |
| One cluster, one admin | Deliberate academic scope |
| Local only | Not secured for public exposure |
| Git changes need Refresh or polling | No webhook on a local cluster |
| Upstream documentation links in some help text | Those settings are documented there |
| Testing is manual | Automated UI tests weren't in scope |

## Future improvements

- Webhooks for instant Git detection
- Failed deployment history stored separately
- HTTPS with a trusted certificate
- Role-based access for multiple users
- Automated end-to-end tests

## If you don't know an answer

Say so, then reason from the architecture: "That would be in the controller, because it owns comparison." `docs/architecture.md` maps each behaviour to its source file.
