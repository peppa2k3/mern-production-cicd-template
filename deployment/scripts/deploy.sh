#!/usr/bin/env bash
# Compatibility path; the canonical implementation is scripts/deploy.sh.
set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/../../scripts/deploy.sh" "$@"
