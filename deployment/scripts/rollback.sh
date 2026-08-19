#!/usr/bin/env bash
#
# rollback.sh — manual rollback helper for production. Run this directly
# on the VPS when you need to roll back outside of the normal CI flow
# (e.g. a bug was found after the automated health check already passed).
#
# Usage (from the deployment directory, or with DEPLOY_PATH set):
#   ./rollback.sh                 # roll back to .deployment/previous
#   ./rollback.sh sha-8f31c8a     # roll back to an explicit image tag
#
# Unlike deploy.sh, this script does NOT attempt a nested rollback if the
# rollback itself fails — it just reports failure plainly so an operator
# can investigate, rather than bouncing between two broken versions.

set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

DEPLOY_PATH="${DEPLOY_PATH:-$(pwd)}"
cd "$DEPLOY_PATH" || die "Deployment directory not found: $DEPLOY_PATH"
validate_deploy_environment

TARGET_TAG="${1:-}"
if [ -z "$TARGET_TAG" ]; then
  TARGET_TAG="$(read_state_value "$PREVIOUS_FILE" DEPLOYED_IMAGE_TAG || true)"
  [ -n "$TARGET_TAG" ] || die "No ${PREVIOUS_FILE} record found. Pass a target tag explicitly, e.g.: ./rollback.sh sha-xxxxxxx (see ${HISTORY_FILE} for past tags)."
fi

CURRENT_TAG="$(read_state_value "$CURRENT_FILE" DEPLOYED_IMAGE_TAG || true)"
log "Manual rollback requested: ${CURRENT_TAG:-unknown} -> ${TARGET_TAG}"

if [ -t 0 ]; then
  read -r -p "Proceed with rollback to '${TARGET_TAG}'? [y/N] " CONFIRM
  case "$CONFIRM" in
    y|Y) ;;
    *) log "Rollback cancelled."; exit 1 ;;
  esac
else
  log "Non-interactive shell detected — proceeding without confirmation."
fi

if attempt_deploy "$TARGET_TAG"; then
  write_state "$TARGET_TAG"
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') MANUAL_ROLLBACK restored=${TARGET_TAG} from=${CURRENT_TAG:-unknown}" >> "$HISTORY_FILE"
  log "Rollback successful. Now running: ${TARGET_TAG}"
  exit 0
else
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') MANUAL_ROLLBACK_FAILED target=${TARGET_TAG}" >> "$HISTORY_FILE"
  log "Rollback FAILED. Manual intervention required."
  log "Check: docker compose -f ${COMPOSE_FILE} ps ; docker compose -f ${COMPOSE_FILE} logs --tail=200"
  exit 2
fi
