# Local setup

How to build and start DeployFlow from nothing, and how to start it again later.

This setup is for local development and academic demonstration only. Never expose it publicly.

## Requirements

| Tool | Used for |
|---|---|
| Windows 11 with WSL2 and the `Ubuntu` distro | Holds the source code |
| Docker Desktop, with Kubernetes enabled (Settings, Kubernetes, cluster type Kind) | Runs the cluster and builds the image |
| `kubectl` | Comes with Docker Desktop |
| Git | Inside WSL |
| About 4 GB of free RAM for building and 2 GB for running | |

## Everyday start

After the first install, Docker Desktop keeps the cluster and everything in it between restarts.

1. Start **Docker Desktop** and wait for **Engine running**.
2. Check that the pods are running in PowerShell:

   ```bash
   kubectl get pods -n argocd
   ```

3. Start the connections. This opens two small windows, which reconnect by themselves when a pod restarts, and opens both pages in your browser. Keep the windows open, and close them to stop:

   ```bash
   powershell -ExecutionPolicy Bypass -File \\wsl.localhost\Ubuntu\home\murali\deployflow\deploy\local\start-deployflow.ps1
   ```

4. Sign in at <http://localhost:8080> as `admin`. To get the password:

   ```bash
   powershell -NoProfile -Command "[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String((kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath='{.data.password}')))"
   ```

## First install

### 1. Get the code

Run these inside WSL:

```bash
git clone https://github.com/muralibolisetti/deployflow.git ~/deployflow
```

```bash
cd ~/deployflow && git switch deployflow-dev
```

```bash
git clone https://github.com/muralibolisetti/student-portal.git ~/student-portal
```

### 2. Install the Argo CD engine

Run these in PowerShell. Create the namespace:

```bash
kubectl create namespace argocd
```

Install the pinned release. The server-side flags are required because the custom resource definitions are too large for a client-side apply:

```bash
kubectl apply -n argocd --server-side --force-conflicts -f \\wsl.localhost\Ubuntu\home\murali\deployflow\manifests\install.yaml
```

Wait for every pod:

```bash
kubectl wait --for=condition=Ready pod --all -n argocd --timeout=420s
```

Let the server speak plain HTTP inside the cluster, so nginx can reach it:

```bash
kubectl patch configmap argocd-cmd-params-cm -n argocd --type merge --patch-file \\wsl.localhost\Ubuntu\home\murali\deployflow\deploy\local\argocd-server-insecure.patch.yaml
```

```bash
kubectl rollout restart deployment argocd-server -n argocd
```

### 3. Build and deploy the DeployFlow UI

Build the image and load it into the cluster node. The first build takes about 8 minutes, and later ones about 5:

```bash
wsl -d Ubuntu -- bash /home/murali/deployflow/deploy/local/build-ui.sh
```

Deploy it:

```bash
kubectl apply -f \\wsl.localhost\Ubuntu\home\murali\deployflow\deploy\local\deployflow-ui.yaml
```

After later rebuilds, restart it to pick up the new image:

```bash
kubectl rollout restart deployment deployflow-ui -n argocd
```

### 4. Connect the sample app

Sign in, then follow Tests 1 and 2 in [manual-testing.md](manual-testing.md).

## Check what is running

| Check | Command |
|---|---|
| Kubernetes node | `kubectl get nodes` |
| DeployFlow and engine pods | `kubectl get pods -n argocd` |
| Sample app pods | `kubectl get pods -n student-portal` |
| Application status | `kubectl get application -n argocd` |
| Containers | `docker ps` |
| Memory | `docker stats --no-stream` |
| DeployFlow logs | `kubectl logs -n argocd deploy/deployflow-ui` |

You can see the same things in Docker Desktop: open **Kubernetes** and choose a namespace, or open **Containers**.

## Save memory

Dex, notifications and ApplicationSet aren't used by the demo. Scaling them down saves about 170 MB, and this was tested with the core features running:

```bash
kubectl scale deployment argocd-dex-server argocd-notifications-controller argocd-applicationset-controller -n argocd --replicas=0
```

Use `--replicas=1` to restore them.

## Remove everything

This deletes the applications and engine from the cluster. It doesn't touch GitHub.

```bash
kubectl delete application student-portal -n argocd
```

```bash
kubectl delete namespace student-portal argocd
```

To remove the cluster itself, use Docker Desktop: Settings, Kubernetes, turn it off.
