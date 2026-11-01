# Testing it yourself

Step-by-step instructions to repeat every test by hand. Start the system first using the **Everyday start** in [setup.md](setup.md).

Three windows are useful:

| Window | Used for |
|---|---|
| Browser | DeployFlow at <http://localhost:8080> and the app at <http://localhost:8090> |
| PowerShell | `kubectl` commands |
| Ubuntu terminal, in `~/student-portal` | Git commands |

Keep the DeployFlow tab visible. It stops updating while hidden.

## Check that everything is running

| Check | How | Expected |
|---|---|---|
| Docker | Docker Desktop shows **Engine running** | Green |
| Kubernetes | `kubectl get nodes` | `desktop-control-plane` is `Ready` |
| Engine and UI | `kubectl get pods -n argocd` | 8 pods `Running` |
| Sample app | `kubectl get pods -n student-portal` | 2 pods `Running` |
| GitHub | Open [the DeployFlow repo](https://github.com/muralibolisetti/deployflow/tree/deployflow-dev) and [the sample repo](https://github.com/muralibolisetti/student-portal) | Both open and show recent commits |
| Local copy | In WSL: `git -C ~/deployflow status -sb` | Up to date with `origin/deployflow-dev` |

## Test 1: Connect a Git repository

1. Sign in, and open **Settings**, then **Repositories**.
2. If `student-portal` is already listed, click its **⋮** menu, then **Disconnect**.
3. Click **Connect Repo**.
4. Choose **VIA HTTP/HTTPS**, type `git`, project blank.
5. Enter `https://github.com/muralibolisetti/student-portal.git`.
6. Click **Connect**.

**Expected:** Connection status shows **Successful**.

## Test 2: Create an application

Only needed if the app doesn't exist. To start again, use the reset in [demo-guide.md](demo-guide.md#reset-to-a-fresh-start).

1. Open **Applications**, then click **New App**.
2. Enter the values listed in the reset section of the demo guide.
3. Click **Create**.

**Expected:** The app appears as **OutOfSync** and **Missing**. `kubectl get all -n student-portal` shows nothing yet.

## Test 3: Deploy

1. Open `student-portal`, click **Sync**, then **Synchronize**.
2. Run `kubectl get pods -n student-portal`.
3. Open <http://localhost:8090>. If it won't load, run the start script from [setup.md](setup.md) again.

**Expected:** **Synced** and **Healthy**, with 2 pods running and the page visible.

## Test 4: Overview panel

1. Open **Applications**.
2. Compare the four counts with what you know is running.
3. Check that **Recent deployments** lists your sync with its commit and time.

**Expected:** Real numbers matching `kubectl get application -n argocd`.

## Test 5: Detect drift

1. Open `student-portal` and keep it visible.
2. In PowerShell:

   ```bash
   kubectl scale deployment student-portal -n student-portal --replicas=5
   ```

**Expected:** **OutOfSync** in about a second, with only the Deployment flagged.

3. Click **Diff**. If the whole file is showing, tick **Compact diff**.

**Expected:** `replicas: 5` on the left and `replicas: 2` on the right.

## Test 6: Sync to fix drift

1. Click **Sync**, then **Synchronize**.
2. Run `kubectl get deployment student-portal -n student-portal`.

**Expected:** **Synced**, `2/2`.

## Test 7: Resource status

1. Open `student-portal` and look at the tree.
2. Click a pod, then open **Summary**, **Events** and **Logs**.

**Expected:** Each resource shows its status, and the pod shows live details.

## Test 8: Update through Git

1. In the Ubuntu terminal:

   ```bash
   ./release.sh v6 "Timetables have been updated."
   ```

2. Check DeployFlow: it may still show **Synced**.
3. Click **Refresh**.

**Expected:** **OutOfSync** in about 5 seconds, with the new commit message.

4. Click **Sync**, then **Synchronize**, and wait for **Healthy**.
5. Wait a few seconds for the new pods, then reload <http://localhost:8090>.

**Expected:** The page shows `v6` and the new message.

## Test 9: History and rollback

1. Click **History and rollback**. Check the commits, times and authors.
2. On an older entry, click **⋮**, **Rollback**, then **OK**.
3. Reload <http://localhost:8090>.

**Expected:** The older page is back, and the app shows **OutOfSync** because Git is newer.

4. Click **Sync**, then **Synchronize**.

**Expected:** The app returns to the latest version and **Synced**.

## Test 10: Error handling

**Bad repository**

1. Under **Settings**, **Repositories**, try connecting `https://github.com/muralibolisetti/does-not-exist.git`.

**Expected:** A red error mentioning "Repository not found", and nothing is saved.

**Bad deployment**

1. In `~/student-portal`, change `replicas: 2` to `replicas: "two"` in `k8s/deployment.yaml`.
2. Commit and push it:

   ```bash
   git commit -am "Test invalid replicas"
   ```

   ```bash
   git push origin main
   ```

3. Click **Refresh**, then **Sync**, then **Synchronize**.

**Expected:** **Sync failed**, the overview shows a red **Failed** entry, and the running app still works.

4. Undo it:

   ```bash
   git revert --no-edit HEAD
   ```

   ```bash
   git push origin main
   ```

5. Click **Refresh**, then **Sync**, then **Synchronize**.

**Expected:** **Synced** and **Healthy**.

## Test 11: Page consistency

1. Reload DeployFlow.
2. Compare the status with:

   ```bash
   kubectl get application student-portal -n argocd
   ```

**Expected:** They match.

## Optional tests

### Self-healing

1. Open the app, click **Details** and scroll to **Sync Policy**. Tick **Enable Auto-Sync** and click **OK**.
2. Wait for **Self Heal** to appear, tick it and click **OK**.
3. Run `kubectl scale deployment student-portal -n student-portal --replicas=5`.

**Expected:** Replicas return to 2 within a few seconds with no clicks.

### Rollback under auto-sync

With auto-sync on, try a rollback.

**Expected:** DeployFlow warns that auto-sync must be turned off.

### Automatic deploy from Git

With auto-sync on, run `./release.sh v7 "Automated release."` and wait. It can take up to about 6 minutes.

**Expected:** It deploys without clicks. History shows **Auto-sync** in the overview.

### Turn auto-sync off

Open **Details**, untick **Enable Auto-Sync** and click **OK**. Stay on the page until Sync Policy says `NONE`. Do this before your demo. **Self Heal** stays ticked, but does nothing while the policy is `NONE`.

### Without optional components

Use the **Save memory** command in [setup.md](setup.md), then repeat Test 5.

**Expected:** It still works.
