#!/usr/bin/env bash
#
# common.sh — shared helpers sourced by deploy.sh, rollback.sh,
# health-check.sh, and cleanup-images.sh. Not meant to be executed
# directly.
#
# Every config value below can be overridden by exporting it before
# calling the script that sources this file (e.g. HEALTH_PATH=/healthz).

set -Eeuo pipefail

log() { printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
die() { log "ERROR: $*"; exit 1; }

require_cmd()  { command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"; }
require_file() { [ -f "$1" ] || die "Required file not found: $1"; }

# Reads KEY=VALUE from a simple state file. Prints the value, or nothing
# (and a non-zero exit) if the file or key doesn't exist yet — this is the
# normal, expected case on a first deployment.
read_state_value() {
  local file="$1" key="$2"
  [ -f "$file" ] || return 1
  grep -E "^${key}=" "$file" | tail -n1 | cut -d'=' -f2-
}

# ---- Shared deployment configuration ----
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
STATE_DIR="${STATE_DIR:-.deployment}"
CURRENT_FILE="$STATE_DIR/current"
PREVIOUS_FILE="$STATE_DIR/previous"
HISTORY_FILE="$STATE_DIR/history.log"

# Adjust these to match the project's real health endpoint. See
# docs/deployment.md for how to verify or add one.
HEALTH_PORT="${HEALTH_PORT:-3000}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
HEALTH_URL="${HEALTH_URL:-http://localhost:${HEALTH_PORT}${HEALTH_PATH}}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_DELAY_SECONDS="${HEALTH_DELAY_SECONDS:-5}"
STARTUP_GRACE_SECONDS="${STARTUP_GRACE_SECONDS:-10}"

# Sanity-checks that this looks like a real, ready deployment directory
# before anything is touched.
validate_deploy_environment() {
  require_cmd docker
  docker compose version >/dev/null 2>&1 \
    || die "Docker Compose v2 plugin not found ('docker compose'). See docs/deployment.md."
  require_file "$COMPOSE_FILE"
  require_file .env
  mkdir -p "$STATE_DIR/history"
}

# Brings up a given immutable image tag and verifies it's actually healthy.
# Returns non-zero (does NOT exit the shell) on any failure so callers can
# decide what to do next (e.g. attempt a rollback).
#   Usage: attempt_deploy <image-tag>
attempt_deploy() {
  local tag="$1"

  log "Validating Compose configuration for tag ${tag}..."
  if ! IMAGE_TAG="$tag" docker compose -f "$COMPOSE_FILE" config -q; then
    log "docker compose config validation failed for tag ${tag}"
    return 1
  fi

  log "Pulling image(s) for tag ${tag}..."
  if ! IMAGE_TAG="$tag" docker compose -f "$COMPOSE_FILE" pull; then
    log "docker compose pull failed for tag ${tag}"
    return 1
  fi

  log "Starting containers for tag ${tag}..."
  if ! IMAGE_TAG="$tag" docker compose -f "$COMPOSE_FILE" up -d --remove-orphans; then
    log "docker compose up failed for tag ${tag}"
    return 1
  fi

  log "Waiting ${STARTUP_GRACE_SECONDS}s for application startup..."
  sleep "$STARTUP_GRACE_SECONDS"

  log "Running health check against ${HEALTH_URL} (up to ${HEALTH_RETRIES} attempts)..."
  if ! HEALTH_URL="$HEALTH_URL" HEALTH_RETRIES="$HEALTH_RETRIES" HEALTH_DELAY_SECONDS="$HEALTH_DELAY_SECONDS" \
      "$SCRIPT_DIR/health-check.sh"; then
    log "Health check failed for tag ${tag}"
    return 1
  fi

  return 0
}

# Records the currently-running tag as deployment state. Deliberately
# contains no secrets — safe to read, log, or commit-inspect.
write_state() {
  local tag="$1"
  {
    echo "DEPLOYED_IMAGE_TAG=${tag}"
    echo "DEPLOYED_COMMIT_SHA=${COMMIT_SHA:-unknown}"
    echo "DEPLOYED_AT=$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  } > "$CURRENT_FILE"
}
