# Local setup

How to start the current environment. This covers the Argo CD baseline; the DeployFlow dashboard will be added once it exists.

This setup is for local development and academic demonstration only. Never expose it publicly.

## Requirements

- Windows 11 with WSL2 and the `Ubuntu` distro
- Docker Desktop with Kubernetes enabled (Settings, Kubernetes)
- `kubectl`, which Docker Desktop provides

Docker Desktop's Kubernetes keeps its state between restarts, so after the first install you can skip to [Start the connections](#start-the-connections).

## First install

Run these in PowerShell.

Create the namespace:

```bash
kubectl --context docker-desktop create namespace argocd
```

Install the pinned Argo CD release. The server-side flags are required, because the custom resource definitions are too large for a client-side apply:

```bash
kubectl --context docker-desktop apply -n argocd --server-side --force-conflicts -f \\wsl.localhost\Ubuntu\home\murali\deployflow\manifests\install.yaml
```

Wait for every pod:

```bash
kubectl --context docker-desktop wait --for=condition=Ready pod --all -n argocd --timeout=420s
```

Allow plain HTTP on this local cluster. The Browser pane in the Claude desktop app rejects Argo CD's self-signed certificate:

```bash
kubectl --context docker-desktop patch configmap argocd-cmd-params-cm -n argocd --type merge --patch-file \\wsl.localhost\Ubuntu\home\murali\deployflow\deploy\local\argocd-server-insecure.patch.yaml
```

```bash
kubectl --context docker-desktop rollout restart deployment argocd-server -n argocd
```

## Start the connections

Each of these keeps running, so use a separate PowerShell tab for each. Both listen on this laptop only.

Argo CD, at <http://localhost:8080>:

```bash
kubectl --context docker-desktop port-forward --address 127.0.0.1 svc/argocd-server -n argocd 8080:80
```

The `student-portal` app, at <http://localhost:8090>:

```bash
kubectl --context docker-desktop port-forward --address 127.0.0.1 svc/student-portal -n student-portal 8090:80
```

## Sign in

The username is `admin`. This PowerShell command prints the generated local password:

```bash
powershell -NoProfile -Command "[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String((kubectl --context docker-desktop get secret argocd-initial-admin-secret -n argocd -o jsonpath='{.data.password}')))"
```

## Check it is healthy

```bash
kubectl --context docker-desktop get pods -n argocd
```

All 7 pods should show `Running`.

## Save memory

These three components are not needed for the demo. Scaling them down saves about 170 MB and was tested with the core features running:

```bash
kubectl --context docker-desktop scale deployment argocd-dex-server argocd-notifications-controller argocd-applicationset-controller -n argocd --replicas=0
```

Use `--replicas=1` to restore them.
