# MERN Production CI/CD Template

A reusable, production-grade CI/CD pipeline for MERN apps (or any
Node.js API + static/SPA frontend): push to `main` → lint/test/build →
Docker Buildx → GitHub Container Registry → SSH deploy to a VPS →
health check → automatic rollback on failure.

Built to be dropped into future projects with minimal changes — see
[`docs/adopting-this-template.md`](docs/adopting-this-template.md) for
what to check first, and [`docs/deployment.md`](docs/deployment.md)
for full VPS setup, secrets, rollback, and security details.

## What's in here

```
.github/workflows/ci-cd.yml           Lint/test/build -> Buildx -> GHCR -> SSH deploy
server/Dockerfile                     Multi-stage Node API image, non-root, pinned LTS
server/.dockerignore
client/Dockerfile                     Multi-stage Vite build -> Nginx static serve
client/.dockerignore
client/nginx.conf                     SPA fallback, gzip, /api reverse proxy
docker-compose.yml                    IMAGE_TAG-driven, Traefik labels, Mongo volume
docker-compose.override.example.yml   Alternative for VPS without Traefik
.env.example                          Secret-free — copy to .env on the VPS only
deployment/scripts/
  common.sh                           Shared helpers + attempt_deploy/write_state
  deploy.sh                           Validate -> pull -> up -> health-check -> rollback
  rollback.sh                         Manual rollback to previous or an explicit tag
  health-check.sh                     Standalone retrying HTTP health check
  cleanup-images.sh                   Safe old-image pruning (never touches current/previous)
docs/
  deployment.md                       First-time VPS setup, secrets, security review, checklist
  adopting-this-template.md           How to adapt this into a specific existing repo
```

## Quick start

1. Read [`docs/adopting-this-template.md`](docs/adopting-this-template.md)
   and adjust the Dockerfiles/paths for the target repo's actual stack.
2. Follow [`docs/deployment.md`](docs/deployment.md) to set up the VPS
   once (Docker, a dedicated deploy user, GHCR auth, `.env`, Traefik or
   its standalone alternative).
3. Add the five secrets under a GitHub Environment named `production`:
   `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_PRIVATE_KEY`,
   `VPS_DEPLOY_PATH`.
4. `git push origin main`.

## Design principles this template follows

- **Immutable deploys**: every production deployment is pinned to
  `sha-<commit>`, never a moving tag.
- **No fragile file mutation**: the image tag is passed as an
  environment variable Compose interpolates — no `sed` hacks against
  `docker-compose.yml`.
- **Real health checks**: retried HTTP checks against an actual
  endpoint, not "container is running."
- **Mandatory rollback**: any failed deployment automatically attempts
  to restore the last known-good tag, and CI still reports failure so
  it isn't silently swallowed.
- **Idempotent**: redeploying the same tag twice is safe.
- **Nothing faked**: lint/test/build steps are discovered from each
  `package.json` — a missing script is skipped with a clear log line,
  never faked as passing.
- **Secrets stay on the VPS**: `.env` is never committed, never synced
  by CI, and never baked into an image.
