#!/usr/bin/env bash
# Only remove unreferenced app images. Every retained verified release is protected.
set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=deployment/scripts/common.sh
source "$SCRIPT_DIR/common.sh"
: "${DEPLOY_PATH:?Set absolute deploy root}"
: "${IMAGE_REPOSITORIES:?Set space-separated application image repositories}"
[[ "$DEPLOY_PATH" =~ ^/[A-Za-z0-9/_-]+$ && "$DEPLOY_PATH" != / ]] || die 'Invalid deploy root'
[[ -d "$DEPLOY_PATH/releases" && -f "$DEPLOY_PATH/shared/current-images.env" ]] || die 'Verified release state missing'
KEEP_IMAGE_VERSIONS="${KEEP_IMAGE_VERSIONS:-5}"
DRY_RUN="${DRY_RUN:-true}"
[[ "$KEEP_IMAGE_VERSIONS" =~ ^[0-9]+$ && "$DRY_RUN" =~ ^(true|false)$ ]] || die 'Invalid retention or dry-run setting'
require_cmd docker
# Share the same lock with apply/verify so cleanup cannot remove candidate images.
exec 9>"$DEPLOY_PATH/shared/deploy.lock"
flock -n 9 || die 'Deployment action running'
protected=()
while IFS= read -r -d '' file; do
  for key in SERVER_IMAGE CLIENT_IMAGE CANDIDATE_SERVER_IMAGE CANDIDATE_CLIENT_IMAGE PREVIOUS_SERVER_IMAGE PREVIOUS_CLIENT_IMAGE; do
    value="$(read_state_value "$file" "$key")"
    [[ -z "$value" ]] || protected+=("$value")
  done
done < <(find "$DEPLOY_PATH/shared" "$DEPLOY_PATH/releases" -type f \( -name '*images.env' -o -name pending-release.env \) -print0)
for repo in $IMAGE_REPOSITORIES; do
  [[ "$repo" =~ ^(ghcr\.io|docker\.io)/[a-z0-9._/-]+$ ]] || die 'Invalid application image repository'
  listing="$(docker image ls "$repo" --format '{{.Tag}}\t{{.CreatedAt}}')"
  mapfile -t tags < <(printf '%s\n' "$listing" | sort -k2 -r | awk -F'\t' '{print $1}')
  kept=0
  for tag in "${tags[@]}"; do
    [[ "$tag" =~ ^[a-f0-9]{40}$ ]] || continue
    image="$repo:$tag"; keep=false
    for ref in "${protected[@]}"; do [[ "$image" != "$ref" ]] || keep=true; done
    [[ "$keep" != true ]] || continue
    kept=$((kept + 1))
    (( kept > KEEP_IMAGE_VERSIONS )) || continue
    if [[ "$DRY_RUN" == true ]]; then
      log "Would remove unreferenced image $image"
    else
      docker image rm "$image" || log "Image in use; retained $image"
    fi
  done
done
