# Demonstration guide

How to run the 5 to 10 minute panel demonstration yourself. Every step is manual. Rehearse it at least once on the day.

## What you are showing

Git holds the desired state of an application. DeployFlow compares that with what is actually running in Kubernetes, shows any difference, and applies changes.

| Part | Role |
|---|---|
| GitHub repo `student-portal` | What should be running |
| Kubernetes cluster | What is actually running |
| DeployFlow | Shows the difference and acts on it |

## Before the panel arrives

Allow 5 minutes.

1. Close unneeded apps, especially Brave tabs. The system needs about 2 GB of free RAM.
2. Start **Docker Desktop**. Wait until it shows **Engine running** and Kubernetes is active.
3. Open **PowerShell** and check the cluster:

   ```bash
   kubectl get pods -n argocd
   ```

   Every pod should show `Running`. If you get a connection error, Kubernetes is still starting. Wait a minute and retry.

4. Start the connections. This opens two small windows that reconnect by themselves, then opens both pages in your browser. Leave those windows open:

   ```bash
   powershell -ExecutionPolicy Bypass -File \\wsl.localhost\Ubuntu\home\murali\deployflow\deploy\local\start-deployflow.ps1
   ```

5. Get the password, then sign in to DeployFlow as `admin`:

   ```bash
   powershell -NoProfile -Command "[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String((kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath='{.data.password}')))"
   ```

6. Keep that PowerShell tab free for the demo commands.
7. Open an Ubuntu terminal for Git, and go to the sample app:

   ```bash
   cd ~/student-portal
   ```

8. In Docker Desktop, open **Kubernetes** and choose the `student-portal` namespace. It's a good live view for the panel.

**Keep the DeployFlow tab visible while demonstrating.** Live updates pause while a tab is hidden. They resume when you return to it.

**Make sure auto-sync is off** before starting: open the app, click **Details**, scroll to **Sync Policy**, and check it says `NONE`.

## Demo 1: Deploy an application (1 minute)

The app is already deployed, so start from the existing state and explain it.

1. Show the **Applications** page: the overview counts and recent deployments.
2. Open **Settings**, then **Repositories**. Point out that `student-portal` shows **Successful**.
3. Go back to **Applications** and open `student-portal`.
4. Show the resource tree: ConfigMap, Service, Deployment, ReplicaSet and two pods.
5. Show the page at <http://localhost:8090>.

**Say:** "DeployFlow read these manifests from GitHub and created these resources in Kubernetes."

To demonstrate a true first deployment, follow [Reset to a fresh start](#reset-to-a-fresh-start) first, then create and sync the app with the steps in [manual-testing.md](manual-testing.md).

## Demo 2: Detect configuration drift (1 minute)

1. In PowerShell, change the cluster directly, without using Git:

   ```bash
   kubectl scale deployment student-portal -n student-portal --replicas=5
   ```

2. In DeployFlow, the status changes to **OutOfSync** within about a second. Only the Deployment is marked.
3. Click **Diff**. If the whole file is showing, tick **Compact diff**. Show `replicas: 5` against `replicas: 2`.

**Say:** "Someone changed the cluster by hand. Git says two replicas, the cluster has five, and DeployFlow noticed immediately because it watches Kubernetes."

## Demo 3: Synchronize (30 seconds)

1. Close the diff, click **Sync**, then **Synchronize**.
2. The app returns to **Synced**. In PowerShell, confirm it:

   ```bash
   kubectl get deployment student-portal -n student-portal
   ```

**Say:** "Sync made the cluster match Git again, so Git stays the source of truth."

## Demo 4: Update through Git (2 minutes)

1. In the Ubuntu terminal, publish a new release:

   ```bash
   ./release.sh v5 "Results are now published."
   ```

2. Show the Student Portal tab: it has not changed yet.
3. In DeployFlow, click **Refresh**. After about 5 seconds it shows **OutOfSync** with the new commit message.
4. Click **Sync**, then **Synchronize**.
5. Reload the Student Portal tab. The new release appears about 4 seconds after the sync, when the new pods are ready.

**Say:** "We never touched the cluster. We changed Git, and DeployFlow applied it."

**If asked why it didn't update alone:** auto-sync is off, and the engine only polls Git, which can take up to about 6 minutes. Refresh checks immediately.

To make the change by hand instead of with the script, edit `k8s/configmap.yaml` and the `release:` line in `k8s/deployment.yaml`, then:

```bash
git add k8s
```

```bash
git commit -m "Update portal"
```

```bash
git push origin main
```

## Demo 5: History and rollback (2 minutes)

1. Open `student-portal` and click **History and rollback**.
2. Show the deployments, with commit, author, time and who started each.
3. On an older version with a different commit, click the **⋮** menu, then **Rollback**, then **OK**. If the menu seems not to open, scroll down: it can open below the window.
4. Wait about 5 seconds and reload the Student Portal tab. The older release is back.
5. Show that DeployFlow now says **OutOfSync**.

**Say:** "The app is back on the old version, but it shows OutOfSync because Git still holds the newer commit. A rollback is an emergency fix. The permanent fix is to revert the commit in Git."

6. To return to the latest version, click **Sync**, then **Synchronize**.

## Demo 6: Self-healing (optional, 1 minute)

1. Open the app, click **Details**, scroll to **Sync Policy**, tick **Enable Auto-Sync**, then click **OK**.
2. Wait a couple of seconds for **Self Heal** to appear. Tick it, then click **OK**.
3. In PowerShell:

   ```bash
   kubectl scale deployment student-portal -n student-portal --replicas=5
   ```

4. Replicas return to 2 in a couple of seconds with no clicks:

   ```bash
   kubectl get deployment student-portal -n student-portal
   ```

**Say:** "With self-healing on, manual changes are undone automatically."

5. **Turn auto-sync back off** afterwards: untick **Enable Auto-Sync**, click **OK**, and stay on the page until Sync Policy says `NONE`. Rollback is refused while auto-sync is on. **Self Heal** stays ticked, but it does nothing while Sync Policy says `NONE`.

## If something goes wrong

| Problem | Fix |
|---|---|
| `localhost:8080` or `8090` will not load | A connection window was closed. Run the start script again |
| Connection window says `lost connection to pod` | Normal after a pod restarts. It reconnects within 2 seconds |
| Port 8090 fails just after a sync or rollback | New pods are replacing the old ones. Wait a few seconds and reload |
| Page status looks stale | Click the tab to bring it forward, or reload |
| Status stays `Synced` after a Git push | Click **Refresh** |
| Rollback option refused | Auto-sync is on. Turn it off |
| `kubectl` connection refused | Docker Desktop is still starting |
| Sign-in fails | Get the password again with the command above |
| Laptop is slow, or drift isn't detected | Close heavy apps, and don't run builds or tests during the demo. Under heavy load the engine paused for over 30 seconds, then recovered by itself. You can also scale down the optional components, as in [setup.md](setup.md) |

## Reset to a fresh start

This removes the app and its resources from the cluster, so Demo 1 can be a real first deployment. It doesn't affect GitHub.

```bash
kubectl delete application student-portal -n argocd
```

```bash
kubectl delete namespace student-portal
```

Then, in DeployFlow, click **New App** and fill in:

| Field | Value |
|---|---|
| Application Name | `student-portal` |
| Project Name | `default` |
| Sync Policy | Manual |
| Auto-Create Namespace | Ticked |
| Repository URL | `https://github.com/muralibolisetti/student-portal.git` |
| Revision | `HEAD` |
| Path | `k8s` |
| Cluster URL | `https://kubernetes.default.svc` |
| Namespace | `student-portal` |
