#!/usr/bin/env bash
set -Eeuo pipefail
: "${HEALTH_URL:?Set HEALTH_URL to the API readiness endpoint}"
for ((attempt=1; attempt<=${HEALTH_RETRIES:-10}; attempt++)); do
  if response="$(curl --fail --silent --show-error --max-time 10 "$HEALTH_URL")" &&
     [[ "$response" == *'"success":true'* ]]; then
    echo 'API readiness passed'; exit 0
  fi
  if (( attempt < ${HEALTH_RETRIES:-10} )); then sleep "${HEALTH_DELAY_SECONDS:-5}"; fi
done
echo 'API readiness failed' >&2
exit 1
