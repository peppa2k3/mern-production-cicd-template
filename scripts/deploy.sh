#!/usr/bin/env bash
# Adapted from template-source/scripts/deploy.sh; manages application services only.
set -Eeuo pipefail
umask 077
action="${1:?Usage: deploy.sh apply|verify|rollback|manual-rollback ROOT SHA [SERVER_IMAGE CLIENT_IMAGE]}"
root="${2:?Set absolute deploy root}"
sha="${3:?Set full commit SHA}"
[[ "$root" =~ ^/[A-Za-z0-9/_-]+$ && "$root" != / ]] || { echo 'Invalid deploy root'; exit 1; }
[[ "$sha" =~ ^[a-f0-9]{40}$ ]] || { echo 'Expected full 40-character SHA'; exit 1; }
shared="$root/shared"
env_file="$shared/server.env"
state="$shared/current-images.env"
pending="$shared/pending-release.env"
release="$root/releases/$sha"

setting() {
  awk -v key="$2" 'index($0, key "=") == 1 { sub(/\r$/, ""); print substr($0, length(key) + 2); exit }' "$1"
}
valid_image() { [[ "$1" =~ ^(ghcr\.io|docker\.io)/[a-z0-9._/-]+:[a-f0-9]{40}$ ]]; }
[[ -f "$env_file" ]] || { echo 'Private shared/server.env missing'; exit 1; }
mode="$(stat -c %a "$env_file")"
(( (8#$mode & 0077) == 0 )) || { echo 'server.env must have mode 600'; exit 1; }
[[ "$(setting "$env_file" NODE_ENV)" == production ]] || { echo 'NODE_ENV must be production'; exit 1; }
project="$(setting "$env_file" APP_NAME)"
domain="$(setting "$env_file" APP_DOMAIN)"
api_domain="$(setting "$env_file" API_DOMAIN)"
web_network="$(setting "$env_file" TRAEFIK_NETWORK)"
storage_network="$(setting "$env_file" STORAGE_NETWORK)"
[[ "$project" =~ ^[a-z][a-z0-9-]+$ ]] || { echo 'Invalid APP_NAME'; exit 1; }
[[ "$domain" =~ ^[a-z0-9.-]+$ && "$api_domain" =~ ^[a-z0-9.-]+$ && "$domain" != "$api_domain" ]] || { echo 'Set distinct APP_DOMAIN and API_DOMAIN'; exit 1; }
[[ "$(setting "$env_file" CLIENT_URL)" == "https://$domain" ]] || { echo 'CLIENT_URL must match HTTPS frontend origin'; exit 1; }
[[ "$web_network" =~ ^[A-Za-z0-9_.-]+$ && "$storage_network" =~ ^[A-Za-z0-9_.-]+$ && "$web_network" != "$storage_network" ]] || { echo 'Set distinct external Traefik/storage networks'; exit 1; }
mongo="$(setting "$env_file" MONGO_URI)"
endpoint="$(setting "$env_file" MINIO_ENDPOINT)"
[[ "$mongo" =~ ^mongodb(\+srv)?:// && "$mongo" != *localhost* && "$mongo" != *127.0.0.1* ]] || { echo 'Set shared non-local MONGO_URI'; exit 1; }
[[ "$endpoint" =~ ^[A-Za-z0-9.-]+$ && "$endpoint" != localhost && "$endpoint" != 127.0.0.1 ]] || { echo 'Set shared non-local MINIO_ENDPOINT'; exit 1; }
for key in TRAEFIK_HTTPS_ENTRYPOINT TRAEFIK_CERT_RESOLVER; do
  [[ "$(setting "$env_file" "$key")" =~ ^[A-Za-z0-9_-]+$ ]] || { echo "Set $key"; exit 1; }
done
# Serialize manual actions as well as CI. The GitHub workflow holds its own lock
# across apply/verify; the pending record also blocks interleaved releases.
exec 9>"$shared/deploy.lock"
flock -n 9 || { echo 'Another deployment action is running'; exit 1; }

compose() {
  local target_sha="$1" server_image="$2" client_image="$3"
  shift 3
  SERVER_ENV_FILE="$env_file" SERVER_IMAGE="$server_image" CLIENT_IMAGE="$client_image" \
    docker compose -p "$project" --project-directory "$root/releases/$target_sha" \
      --env-file "$env_file" -f "$root/releases/$target_sha/docker-compose.prod.yml" "$@"
}
check_manifest() {
  local services
  services="$(compose "$1" "$2" "$3" config --services)" || return 1
  [[ "$services" == $'server\nclient' || "$services" == $'client\nserver' ]] || {
    echo 'Compose must contain only server/client; inspect legacy migration separately'; return 1;
  }
}
write_state() {
  local file="$1"
  printf 'RELEASE_SHA=%s\nSERVER_IMAGE=%s\nCLIENT_IMAGE=%s\n' "$2" "$3" "$4" > "$file.tmp.$$"
  mv -f "$file.tmp.$$" "$file"
}
check_release() {
  local service cid health response status body url
  for service in server client; do
    cid="$(compose "$1" "$2" "$3" ps -a -q "$service")" || return 1
    [[ -n "$cid" ]] || { echo "Missing container: $service"; return 1; }
    health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid")" || return 1
    [[ "$health" == healthy ]] || { echo "Unhealthy container: $service ($health)"; return 1; }
  done
  for url in "https://$domain/" "https://$domain/api/health" "https://$api_domain/api/health"; do
    response="$(curl --fail --silent --show-error --max-time 20 --retry 3 --retry-all-errors --retry-delay 2 --write-out '\n%{http_code}' "$url")" || return 1
    status="${response##*$'\n'}"; body="${response%$'\n'*}"
    [[ "$status" == 200 ]] || { echo "Unexpected HTTP $status at $url"; return 1; }
    if [[ "$url" == */api/health ]]; then
      [[ "$body" == *'"success":true'* ]] || { echo "Invalid health response at $url"; return 1; }
    else
      [[ "$body" == *'<title>Affiliate Hub'* && "$body" == *'<div id="root"></div>'* ]] || { echo 'Unexpected frontend response'; return 1; }
    fi
  done
}
point_current() {
  ln -sfn "$root/releases/$1" "$root/.current-$sha" || return 1
  mv -Tf "$root/.current-$sha" "$root/current"
}
rollback_pending() {
  [[ -f "$pending" ]] || { echo 'No pending release; no rollback needed'; return 0; }
  [[ "$(setting "$pending" PENDING_SHA)" == "$sha" ]] || { echo 'Another release is pending'; return 1; }
  local old_sha old_server old_client candidate_server candidate_client
  old_sha="$(setting "$pending" PREVIOUS_SHA)"
  old_server="$(setting "$pending" PREVIOUS_SERVER_IMAGE)"; old_client="$(setting "$pending" PREVIOUS_CLIENT_IMAGE)"
  candidate_server="$(setting "$pending" CANDIDATE_SERVER_IMAGE)"; candidate_client="$(setting "$pending" CANDIDATE_CLIENT_IMAGE)"
  valid_image "$candidate_server" && valid_image "$candidate_client" || return 1
  check_manifest "$sha" "$candidate_server" "$candidate_client" || return 1
  if [[ -z "$old_sha" ]]; then
    compose "$sha" "$candidate_server" "$candidate_client" rm -f -s client server || return 1
    rm -f "$pending"
    echo 'First release failed; candidate app containers removed. Shared storage unchanged.'
    return 0
  fi
  [[ "$old_sha" =~ ^[a-f0-9]{40}$ ]] && valid_image "$old_server" && valid_image "$old_client" || return 1
  check_manifest "$old_sha" "$old_server" "$old_client" || return 1
  compose "$old_sha" "$old_server" "$old_client" up -d --no-deps --no-build --pull never --wait --wait-timeout 180 server client || return 1
  check_release "$old_sha" "$old_server" "$old_client" || return 1
  write_state "$state" "$old_sha" "$old_server" "$old_client" || return 1
  point_current "$old_sha" || return 1
  rm -f "$pending"
  echo "Restored verified release $old_sha; shared storage unchanged."
}
rollback_on_error() {
  local result=$?
  trap - EXIT
  if (( result != 0 )); then
    rollback_pending || echo 'Automatic rollback failed; inspect pending-release.env and VPS health.' >&2
  fi
  exit "$result"
}
apply_release() {
  [[ -f "$release/docker-compose.prod.yml" ]] || { echo 'Release Compose missing'; return 1; }
  [[ ! -e "$pending" ]] || { echo 'Resolve pending release first'; return 1; }
  docker network inspect "$web_network" >/dev/null 2>&1
  docker network inspect "$storage_network" >/dev/null 2>&1
  local cid owner labels cids previous_sha='' previous_server='' previous_client='' server_image="$1" client_image="$2"
  cids="$(docker ps -q --filter "network=$web_network")"
  while IFS= read -r cid; do
    [[ -n "$cid" ]] || continue
    owner="$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project"}}' "$cid")"
    [[ "$owner" != "$project" ]] || continue
    labels="$(docker inspect -f '{{json .Config.Labels}}' "$cid")"
    if [[ "$labels" == *"Host(\`$domain\`)"* || "$labels" == *"Host(\`$api_domain\`)"* || "$labels" == *"routers.$project-"* ]]; then
      echo "Another container owns an application domain/router: $cid"; return 1
    fi
  done <<< "$cids"
  if [[ -f "$state" ]]; then
    previous_sha="$(setting "$state" RELEASE_SHA)"
    previous_server="$(setting "$state" SERVER_IMAGE)"; previous_client="$(setting "$state" CLIENT_IMAGE)"
    if [[ ! "$previous_sha" =~ ^[a-f0-9]{40}$ ]] || ! valid_image "$previous_server" || ! valid_image "$previous_client"; then
      echo 'Invalid current release state'; return 1
    fi
    check_manifest "$previous_sha" "$previous_server" "$previous_client"
  else
    [[ -z "$(docker ps -aq --filter "label=com.docker.compose.project=$project")" ]] || { echo 'Project exists without verified state; inspect before bootstrap'; return 1; }
  fi
  [[ "$server_image" != - ]] || server_image="$previous_server"
  [[ "$client_image" != - ]] || client_image="$previous_client"
  if ! valid_image "$server_image" || ! valid_image "$client_image"; then
    echo 'First release requires both full-SHA image refs'; return 1
  fi
  check_manifest "$sha" "$server_image" "$client_image"
  compose "$sha" "$server_image" "$client_image" config --quiet
  docker pull "$server_image"
  docker pull "$client_image"
  {
    printf 'PENDING_SHA=%s\nPREVIOUS_SHA=%s\n' "$sha" "$previous_sha"
    printf 'PREVIOUS_SERVER_IMAGE=%s\nPREVIOUS_CLIENT_IMAGE=%s\n' "$previous_server" "$previous_client"
    printf 'CANDIDATE_SERVER_IMAGE=%s\nCANDIDATE_CLIENT_IMAGE=%s\n' "$server_image" "$client_image"
  } > "$pending.tmp.$$"
  mv -f "$pending.tmp.$$" "$pending"
  trap rollback_on_error EXIT
  compose "$sha" "$server_image" "$client_image" up -d --no-deps --no-build --pull never --wait --wait-timeout 180 server client
  trap - EXIT
  echo "Candidate $sha running; verify HTTPS before promotion."
}
verify_release() {
  [[ -f "$pending" && "$(setting "$pending" PENDING_SHA)" == "$sha" ]] || { echo 'No matching pending release'; return 1; }
  trap rollback_on_error EXIT
  local server_image client_image
  server_image="$(setting "$pending" CANDIDATE_SERVER_IMAGE)"; client_image="$(setting "$pending" CANDIDATE_CLIENT_IMAGE)"
  valid_image "$server_image" && valid_image "$client_image" || return 1
  check_manifest "$sha" "$server_image" "$client_image"
  check_release "$sha" "$server_image" "$client_image"
  write_state "$release/images.env" "$sha" "$server_image" "$client_image"
  point_current "$sha"
  write_state "$state" "$sha" "$server_image" "$client_image"
  rm -f "$pending"
  trap - EXIT
  echo "Release $sha verified and promoted."
}
case "$action" in
  apply) [[ $# == 5 ]]; apply_release "$4" "$5" ;;
  verify) [[ $# == 3 ]]; verify_release ;;
  rollback) [[ $# == 3 ]]; rollback_pending ;;
  manual-rollback)
    [[ $# == 3 && -f "$release/images.env" ]] || { echo 'Verified target images.env missing'; exit 1; }
    apply_release "$(setting "$release/images.env" SERVER_IMAGE)" "$(setting "$release/images.env" CLIENT_IMAGE)"
    verify_release
    ;;
  *) echo 'Unknown deployment action'; exit 1 ;;
esac
