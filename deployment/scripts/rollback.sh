#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="${DEPLOY_PATH:?Set DEPLOY_PATH to the absolute deployment root}"
sha="${1:?Usage: DEPLOY_PATH=/srv/apps/myapp bash rollback.sh <verified-40-character-sha>}"
exec bash "$SCRIPT_DIR/../../scripts/deploy.sh" manual-rollback "$root" "$sha"
