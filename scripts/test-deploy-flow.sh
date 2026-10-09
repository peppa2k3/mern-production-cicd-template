#!/usr/bin/env bash
set -Eeuo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
scratch="$(mktemp -d "${TMPDIR:-/tmp}/mern-test-deploy-XXXXXXXX")"
scratch="$(cd "$scratch" && pwd -P)"
[[ "$scratch" == "${TMPDIR:-/tmp}"/mern-test-deploy-* ]] || { echo 'Unsafe scratch path'; exit 1; }
trap 'rm -rf -- "$scratch"' EXIT
mkdir -p "$scratch/bin"
export MOCK_LOG="$scratch/docker.log"
export PATH="$scratch/bin:$PATH"

cat > "$scratch/bin/docker" <<'MOCK'
#!/usr/bin/env bash
set -Eeuo pipefail
case "$1" in
  network) [[ "$2" == inspect ]] ;;
  ps) : ;;
  pull) printf 'pull %s\n' "$2" >> "$MOCK_LOG" ;;
  inspect)
    if [[ "$*" == *'.State.Health'* ]]; then printf 'healthy\n'; else printf 'null\n'; fi
    ;;
  compose)
    printf 'compose %s\n' "$*" >> "$MOCK_LOG"
    if [[ -n "${MOCK_FAIL_SHA:-}" && "$*" == *"$MOCK_FAIL_SHA"* && " $* " == *' up '* ]]; then exit 1; fi
    file=''
    previous=''
    for arg in "$@"; do
      if [[ "$previous" == -f ]]; then file="$arg"; fi
      previous="$arg"
    done
    case " $* " in
      *' config --services '*)
        printf 'server\nclient\n'
        if grep -q '^  mongo:' "$file"; then printf 'mongo\n'; fi
        ;;
      *' ps -a -q server '*) printf 'server-cid\n' ;;
      *' ps -a -q client '*) printf 'client-cid\n' ;;
    esac
    ;;
  *) echo "Unexpected docker command: $*" >&2; exit 1 ;;
esac
MOCK

cat > "$scratch/bin/curl" <<'MOCK'
#!/usr/bin/env bash
set -Eeuo pipefail
url="${*: -1}"
if [[ -n "${MOCK_FAIL_ONCE:-}" && -f "$MOCK_FAIL_ONCE" ]]; then rm -f "$MOCK_FAIL_ONCE"; exit 1; fi
if [[ "$url" == */api/health ]]; then
  printf '{"success":true}\n200'
else
  printf '<title>Affiliate Hub</title><div id="root"></div>\n200'
fi
MOCK
cat > "$scratch/bin/ln" <<'MOCK'
#!/usr/bin/env bash
set -Eeuo pipefail
# Model the target symlink as a file so this test runs in Git Bash on Windows.
printf '%s\n' "${@: -2:1}" > "${@: -1}"
MOCK
chmod +x "$scratch/bin/docker" "$scratch/bin/curl" "$scratch/bin/ln"

sha_a="$(printf 'a%.0s' {1..40})"
sha_b="$(printf 'b%.0s' {1..40})"
image_a="ghcr.io/example/repo/server:$sha_a"
web_a="ghcr.io/example/repo/web:$sha_a"
image_b="ghcr.io/example/repo/server:$sha_b"
web_b="ghcr.io/example/repo/web:$sha_b"

make_root() {
  local root="$1"
  mkdir -p "$root/shared" "$root/releases/$sha_a" "$root/releases/$sha_b"
  cp "$repo/docker-compose.prod.yml" "$root/releases/$sha_a/docker-compose.prod.yml"
  cp "$repo/docker-compose.prod.yml" "$root/releases/$sha_b/docker-compose.prod.yml"
  cat > "$root/shared/server.env" <<'ENV'
NODE_ENV=production
APP_NAME=affiliate-app
APP_DOMAIN=affiliate.example.com
API_DOMAIN=api.affiliate.example.com
TRAEFIK_NETWORK=web
CLIENT_URL=https://affiliate.example.com
MONGO_URI=mongodb://db:27017/test
MINIO_ENDPOINT=storage
STORAGE_NETWORK=shared_storage
TRAEFIK_HTTPS_ENTRYPOINT=websecure
TRAEFIK_CERT_RESOLVER=resolver
ENV
  chmod 600 "$root/shared/server.env"
}

root="$scratch/root"
make_root "$root"
bash "$repo/scripts/deploy.sh" apply "$root" "$sha_a" "$image_a" "$web_a"
bash "$repo/scripts/deploy.sh" verify "$root" "$sha_a"
bash "$repo/scripts/deploy.sh" apply "$root" "$sha_b" "$image_b" "$web_b"
bash "$repo/scripts/deploy.sh" rollback "$root" "$sha_b"
[[ "$(sed -n 's/^RELEASE_SHA=//p' "$root/shared/current-images.env")" == "$sha_a" ]]
[[ ! -e "$root/shared/pending-release.env" ]]

# Unchanged client reuses the verified ref, rather than guessing the new tag.
bash "$repo/scripts/deploy.sh" apply "$root" "$sha_b" "$image_b" -
grep -q "CANDIDATE_CLIENT_IMAGE=$web_a" "$root/shared/pending-release.env"
# A different release cannot consume or roll back someone else's pending state.
if bash "$repo/scripts/deploy.sh" verify "$root" "$sha_a" >/dev/null 2>&1; then exit 1; fi
[[ -f "$root/shared/pending-release.env" ]]
touch "$scratch/fail-health"
if MOCK_FAIL_ONCE="$scratch/fail-health" bash "$repo/scripts/deploy.sh" verify "$root" "$sha_b" >/dev/null 2>&1; then
  echo 'Failed HTTPS verification was accepted'; exit 1
fi
[[ ! -e "$root/shared/pending-release.env" ]]
[[ "$(sed -n 's/^RELEASE_SHA=//p' "$root/shared/current-images.env")" == "$sha_a" ]]
if MOCK_FAIL_SHA="$sha_b" bash "$repo/scripts/deploy.sh" apply "$root" "$sha_b" "$image_b" "$web_b" >/dev/null 2>&1; then
  echo 'Failed Compose up was accepted'; exit 1
fi
[[ ! -e "$root/shared/pending-release.env" ]]
bash "$repo/scripts/deploy.sh" manual-rollback "$root" "$sha_a"

first="$scratch/first"
make_root "$first"
bash "$repo/scripts/deploy.sh" apply "$first" "$sha_b" "$image_b" "$web_b"
bash "$repo/scripts/deploy.sh" rollback "$first" "$sha_b"
[[ ! -e "$first/shared/pending-release.env" && ! -e "$first/shared/current-images.env" ]]
grep -q ' rm -f -s client server' "$MOCK_LOG"

legacy="$scratch/legacy"
make_root "$legacy"
printf '  mongo:\n    image: mongo:4.0\n' >> "$legacy/releases/$sha_a/docker-compose.prod.yml"
printf 'RELEASE_SHA=%s\nSERVER_IMAGE=%s\nCLIENT_IMAGE=%s\n' "$sha_a" "$image_a" "$web_a" > "$legacy/shared/current-images.env"
if bash "$repo/scripts/deploy.sh" apply "$legacy" "$sha_b" "$image_b" "$web_b" > /dev/null 2>&1; then
  echo 'Legacy four-service release was accepted' >&2
  exit 1
fi

if grep -E ' (stop|rm|up|down) .*\b(mongo|minio)\b|(^| )down --volumes' "$MOCK_LOG"; then
  echo 'Deployment attempted to manage shared services' >&2
  exit 1
fi
echo 'Deploy flow passed: verify, rollback, partial image reuse, wrong pending SHA, HTTPS/up failure, manual rollback, first-release cleanup, legacy guard.'
