#!/usr/bin/env bash
set -Eeuo pipefail
log() { printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
die() { log "ERROR: $*"; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing command: $1"; }
read_state_value() {
  [[ -f "$1" ]] || return 1
  awk -v key="$2" 'index($0, key "=") == 1 { sub(/\r$/, ""); print substr($0, length(key) + 2); exit }' "$1"
}
