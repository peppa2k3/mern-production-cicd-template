#!/usr/bin/env bash
#
# cleanup-images.sh — safely prunes old immutable image versions on the
# VPS so disk usage doesn't grow unbounded. Intended to be run
# periodically (e.g. a weekly cron job), NOT as part of every deployment.
#
# Safety rules:
#   - never removes the currently running tag (.deployment/current)
#   - never removes the previous tag (.deployment/previous), kept for rollback
#   - keeps the KEEP_IMAGE_VERSIONS most recent tags beyond those two
#   - only touches the repositories listed in IMAGE_REPOSITORIES — never a
#     blanket `docker system prune -a`, which could remove images
#     belonging to other projects sharing this VPS
#
# Usage:
#   DEPLOY_PATH=/srv/apps/myapp \
#   IMAGE_REPOSITORIES="ghcr.io/org/app-server ghcr.io/org/app-client" \
#   ./cleanup-images.sh
#
# Add DRY_RUN=true to preview what would be removed without removing it.

set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

: "${DEPLOY_PATH:?DEPLOY_PATH is required}"
: "${IMAGE_REPOSITORIES:?IMAGE_REPOSITORIES is required, e.g. 'ghcr.io/org/app-server ghcr.io/org/app-client'}"
KEEP_IMAGE_VERSIONS="${KEEP_IMAGE_VERSIONS:-5}"
DRY_RUN="${DRY_RUN:-false}"

cd "$DEPLOY_PATH" || die "Deployment directory not found: $DEPLOY_PATH"
require_cmd docker

CURRENT_TAG="$(read_state_value "$STATE_DIR/current" DEPLOYED_IMAGE_TAG || true)"
PREVIOUS_TAG="$(read_state_value "$STATE_DIR/previous" DEPLOYED_IMAGE_TAG || true)"
log "Protected tags — current: ${CURRENT_TAG:-none}, previous: ${PREVIOUS_TAG:-none}"
log "Retention: keep ${KEEP_IMAGE_VERSIONS} most recent tag(s) per repository beyond the protected ones."
[ "$DRY_RUN" = "true" ] && log "DRY_RUN=true — no images will actually be removed."

for repo in $IMAGE_REPOSITORIES; do
  log "Scanning ${repo}..."

  # Newest first, excluding the floating 'latest' tag (never cleaned up here).
  mapfile -t tags < <(docker image ls "${repo}" --format '{{.Tag}}\t{{.CreatedAt}}' \
    | grep -v '^latest' \
    | sort -k2 -r \
    | awk -F'\t' '{print $1}')

  if [ "${#tags[@]}" -eq 0 ]; then
    log "No local images found for ${repo} — skipping."
    continue
  fi

  kept=0
  for tag in "${tags[@]}"; do
    if [ "$tag" = "$CURRENT_TAG" ] || [ "$tag" = "$PREVIOUS_TAG" ]; then
      log "Keeping ${repo}:${tag} (protected — current or previous deployment)"
      continue
    fi
    kept=$((kept + 1))
    if [ "$kept" -le "$KEEP_IMAGE_VERSIONS" ]; then
      log "Keeping ${repo}:${tag} (within retention window)"
      continue
    fi

    if [ "$DRY_RUN" = "true" ]; then
      log "[dry-run] Would remove ${repo}:${tag}"
    else
      log "Removing ${repo}:${tag}..."
      docker image rm "${repo}:${tag}" >/dev/null 2>&1 \
        && log "  removed ${repo}:${tag}" \
        || log "  skip ${repo}:${tag} (in use or already removed)"
    fi
  done
done

log "Cleanup complete."
