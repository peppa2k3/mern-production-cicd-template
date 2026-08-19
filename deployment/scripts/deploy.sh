#!/usr/bin/env bash
#
# deploy.sh — production deployment with automatic rollback.
# Runs ON the VPS (invoked over SSH by .github/workflows/ci-cd.yml, or
# manually for a first-time deployment — see docs/deployment.md).
#
# Required environment variables:
#   IMAGE_TAG     Immutable tag to deploy, e.g. sha-8f31c8a
#   DEPLOY_PATH   Absolute path to the deployment directory on this host
#
# Optional environment variables (defaults shown):
#   COMPOSE_FILE          docker-compose.yml
#   HEALTH_PORT           3000
#   HEALTH_PATH           /api/health
#   HEALTH_RETRIES        10
#   HEALTH_DELAY_SECONDS  5
#   STARTUP_GRACE_SECONDS 10
#   COMMIT_SHA            full commit SHA, stored in deployment metadata only
#
# Exit codes:
#   0  deployment succeeded
#   1  deployment failed, automatic rollback succeeded (previous version restored)
#   2  deployment failed, rollback also failed — manual intervention required
#   3  deployment failed, no previous version existed to roll back to
#
# This script never runs `docker compose down`, never runs
# `docker compose down -v`, and never mutates docker-compose.yml — the
# target image tag is passed as the IMAGE_TAG environment variable that
# the compose file interpolates (see docker-compose.yml).

set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

: "${IMAGE_TAG:?IMAGE_TAG is required, e.g. sha-8f31c8a}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
NEW_TAG="$IMAGE_TAG"

cd "$DEPLOY_PATH" || die "Deployment directory not found: $DEPLOY_PATH"
validate_deploy_environment

log "=== Deployment started — target: ${NEW_TAG} ==="

OLD_TAG="$(read_state_value "$CURRENT_FILE" DEPLOYED_IMAGE_TAG || true)"
if [ -n "$OLD_TAG" ]; then
  log "Currently deployed tag: ${OLD_TAG}"
else
  log "No previous deployment found. This looks like the first deployment."
fi

if [ "$OLD_TAG" = "$NEW_TAG" ]; then
  log "Target tag matches the currently deployed tag — re-applying idempotently."
fi

if attempt_deploy "$NEW_TAG"; then
  if [ -n "$OLD_TAG" ] && [ "$OLD_TAG" != "$NEW_TAG" ]; then
    cp "$CURRENT_FILE" "$PREVIOUS_FILE" 2>/dev/null || true
  fi
  write_state "$NEW_TAG"
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') SUCCESS deployed=${NEW_TAG} previous=${OLD_TAG:-none}" >> "$HISTORY_FILE"
  log "=== Deployment successful: ${NEW_TAG} ==="
  exit 0
fi

log "Deployment of ${NEW_TAG} FAILED."

if [ -z "$OLD_TAG" ]; then
  log "No previous deployment exists — nothing to roll back to. Manual intervention required."
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') FAILED deployed=${NEW_TAG} rollback=unavailable" >> "$HISTORY_FILE"
  exit 3
fi

log "Attempting automatic rollback to previous tag: ${OLD_TAG}..."
if attempt_deploy "$OLD_TAG"; then
  write_state "$OLD_TAG"
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') FAILED deployed=${NEW_TAG} rollback=success restored=${OLD_TAG}" >> "$HISTORY_FILE"
  log "Deployment failed. Rollback successful. Restored: ${OLD_TAG}"
  # Exit non-zero even though rollback succeeded, so CI accurately reports
  # that the attempted deployment of ${NEW_TAG} failed.
  exit 1
else
  echo "$(date -u +'%Y-%m-%dT%H:%M:%SZ') FAILED deployed=${NEW_TAG} rollback=failed" >> "$HISTORY_FILE"
  log "Deployment failed. Rollback failed. MANUAL INTERVENTION REQUIRED."
  log "Check: docker compose -f ${COMPOSE_FILE} ps ; docker compose -f ${COMPOSE_FILE} logs --tail=200"
  exit 2
fi
