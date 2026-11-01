#!/bin/bash
# Builds the DeployFlow UI image and loads it into the Docker Desktop Kubernetes node.
# Run inside WSL:  bash ~/deployflow/deploy/local/build-ui.sh
#
# The build context is streamed as a tar file because ui/tsconfig.json is a symlink,
# which Docker cannot read through the Windows \\wsl.localhost path.
set -euo pipefail

IMAGE="${1:-deployflow-ui:0.1.0}"
DOCKER='/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe'
UI_DIR="$(cd "$(dirname "$0")/../../ui" && pwd)"
NODE=desktop-control-plane

echo "== Building $IMAGE"
tar -C "$UI_DIR" --exclude=./node_modules --exclude=./dist -cf - . |
    "$DOCKER" build --progress=plain -f Dockerfile.deployflow -t "$IMAGE" -

echo "== Loading $IMAGE into $NODE"
"$DOCKER" save "$IMAGE" | "$DOCKER" exec -i "$NODE" ctr -n k8s.io images import -

echo "== Done"
