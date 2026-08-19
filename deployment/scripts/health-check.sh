#!/usr/bin/env bash
#
# health-check.sh — polls an HTTP health endpoint with retries until it
# succeeds or the retry budget is exhausted. Used by deploy.sh, and safe
# to run standalone (e.g. from cron or an external monitor).
#
# Required environment variables:
#   HEALTH_URL   e.g. http://localhost:3000/api/health
#
# Optional environment variables:
#   HEALTH_RETRIES        default: 10
#   HEALTH_DELAY_SECONDS  default: 5

set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./common.sh
source "$SCRIPT_DIR/common.sh"

: "${HEALTH_URL:?HEALTH_URL is required, e.g. http://localhost:3000/api/health}"
HEALTH_RETRIES="${HEALTH_RETRIES:-10}"
HEALTH_DELAY_SECONDS="${HEALTH_DELAY_SECONDS:-5}"

require_cmd curl

for attempt in $(seq 1 "$HEALTH_RETRIES"); do
  log "Health check attempt ${attempt}/${HEALTH_RETRIES}: ${HEALTH_URL}"
  if curl --fail --silent --show-error --max-time 5 "$HEALTH_URL" > /dev/null; then
    log "Health check passed."
    exit 0
  fi
  if [ "$attempt" -lt "$HEALTH_RETRIES" ]; then
    log "Not healthy yet — retrying in ${HEALTH_DELAY_SECONDS}s..."
    sleep "$HEALTH_DELAY_SECONDS"
  fi
done

log "Health check FAILED after ${HEALTH_RETRIES} attempts against ${HEALTH_URL}."
exit 1
