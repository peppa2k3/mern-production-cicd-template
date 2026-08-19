# Production Deployment Guide

This document covers first-time production VPS setup, how the CI/CD
pipeline operates day-to-day, and how to roll back or recover manually.
For how to adapt the template's code to a *specific* repository (Node
version, package manager, folder names, health endpoint), see
[`adopting-this-template.md`](./adopting-this-template.md).

## 1. Architecture

```
git push origin main
       │
       ▼
GitHub Actions (.github/workflows/ci-cd.yml)
       │
       ├── quality:  install → lint → test → build check   (client + server)
       ├── docker:   Buildx build → push to GHCR            (sha-<7char> + latest)
       └── deploy:   scp scripts+compose → ssh → deploy.sh
                          │
                          ▼
                   Production VPS
                          │
              ┌───────────┴───────────┐
              │   deploy.sh:          │
              │   validate → pull →   │
              │   up -d → health-check│
              │                       │
              │  SUCCESS → done       │
              │  FAILURE → rollback   │
              │   to previous tag     │
              └───────────────────────┘
```

- Images are tagged with the immutable `sha-<7-char-commit>` format and
  deployed by that tag — never by a moving `latest` tag.
- `docker-compose.yml` never gets edited by the pipeline. The tag is
  injected as the `IMAGE_TAG` environment variable at deploy time.
- `.env` (containing real secrets) lives only on the VPS. CI never
  reads it, writes it, or syncs it.
- State (`current` deployed tag, `previous` tag, and a history log) is
  tracked in `.deployment/` on the VPS for auditability and rollback.

## 2. First-time VPS setup

These steps assume a fresh Ubuntu 22.04/24.04 (or Debian 12) VPS. Run
them once per server, not per project.

### 2.1 OS updates

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Install Docker Engine + Compose v2 plugin

Follow Docker's official install instructions for your distribution
(https://docs.docker.com/engine/install/), which installs the
`docker-compose-plugin` package alongside the engine. Verify:

```bash
docker --version
docker compose version   # must succeed — this template uses "docker compose",
                          # not the standalone "docker-compose" v1 binary
```

### 2.3 Create a dedicated deploy user (avoid root SSH)

```bash
sudo adduser deploy
sudo usermod -aG docker deploy
```

Adding `deploy` to the `docker` group lets it run `docker` /
`docker compose` without `sudo` — this is the same privilege level as
root over containers on this host, so treat the deploy user's SSH key
with the same care as a root key, and use it for nothing else.

### 2.4 Set up SSH key authentication for GitHub Actions

On your own machine (not the VPS), generate a dedicated deploy key —
don't reuse a personal key:

```bash
ssh-keygen -t ed25519 -f ./gh-actions-deploy-key -C "github-actions-deploy" -N ""
```

Copy the **public** key to the VPS:

```bash
ssh-copy-id -i ./gh-actions-deploy-key.pub deploy@YOUR_VPS_IP
```

The **private** key content (`cat ./gh-actions-deploy-key`) becomes the
`VPS_SSH_PRIVATE_KEY` GitHub secret (see §3). Delete the local copy
once it's stored in GitHub, or keep it in a password manager only.

Avoid `StrictHostKeyChecking=no`. If you want strict host verification,
capture the host's fingerprint once and pass it as the `fingerprint`
input on the `appleboy/ssh-action` / `appleboy/scp-action` steps in the
workflow:

```bash
ssh-keyscan -t ed25519 YOUR_VPS_IP | ssh-keygen -lf -
```

### 2.5 Authenticate the VPS to GHCR (Option A: pre-authenticated VPS)

GHCR packages are private by default. Rather than passing a registry
credential through every deployment (Option B in the original spec),
this template authenticates the VPS **once**, which is simpler to
operate and keeps the credential off the CI → SSH path entirely:

1. On GitHub, create a fine-grained personal access token scoped to
   just this repository with **read:packages** permission (or a
   classic PAT with the `read:packages` scope if you prefer).
2. On the VPS, as the `deploy` user:

   ```bash
   echo "YOUR_PAT" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

   This stores the credential in `~/.docker/config.json` on the VPS
   only — it never touches Git, CI logs, or deployment metadata.
3. Alternatively, make the GHCR package public (repo → Packages →
   package settings → Change visibility) and skip this step entirely.

Set a calendar reminder to rotate the PAT before it expires.

### 2.6 Traefik (recommended) or a standalone alternative

`docker-compose.yml` assumes Traefik is already running on this VPS as
the shared edge reverse proxy, handling TLS via Let's Encrypt, so
multiple apps on one server can share ports 80/443. If Traefik is
already running, confirm its Docker network name (referenced as
`TRAEFIK_NETWORK` in `.env`):

```bash
docker network ls | grep traefik
```

If this VPS does **not** run Traefik, use
`docker-compose.override.example.yml` instead — see the comments in
that file for the direct-port-publishing alternative, and put your own
TLS termination (Nginx+certbot, Caddy, etc.) in front of it.

### 2.7 Project directory

```bash
sudo mkdir -p /srv/apps/myapp
sudo chown deploy:deploy /srv/apps/myapp
```

This path becomes the `VPS_DEPLOY_PATH` GitHub secret. The CI pipeline
`scp`s `docker-compose.yml` and `deployment/scripts/` into it on every
deploy — but **the directory itself must already exist**, and you must
place a real `.env` in it before the first deployment (step 2.8).
`deploy.sh` will refuse to run without one.

### 2.8 Create `.env` on the VPS

```bash
cd /srv/apps/myapp
cp .env.example .env   # copy this template's .env.example, or write one from scratch
nano .env               # fill in APP_DOMAIN, MONGO_URI, JWT_SECRET, SESSION_SECRET, etc.
```

Never commit this file. Never let CI overwrite it.

### 2.9 Firewall

If this VPS runs Traefik as the sole entry point:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Do **not** open the MongoDB port (27017) or the raw app ports (3000,
etc.) — they're only reachable on the internal Docker network, and
should stay that way.

### 2.10 Health endpoint

This template assumes the backend exposes `GET /api/health` returning
HTTP 200. If the target project doesn't have one, add a minimal
Express handler:

```js
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});
```

If the real endpoint lives elsewhere, set `HEALTH_PATH` /
`HEALTH_PORT` as environment overrides where `deploy.sh` is invoked
(the workflow's `envs:` list and the script call in `ci-cd.yml`).

### 2.11 Backups

Deployment is not a backup strategy. At minimum, set up:

- **MongoDB**: a scheduled `mongodump` (cron) writing to a path outside
  the `mongo_data` volume, shipped off the VPS (object storage, another
  host). Test restores periodically — an untested backup is not a
  backup.
- **VPS-level**: snapshots through your hosting provider on a regular
  schedule, retained for a meaningful window (e.g. 7 daily + 4 weekly).
- **Docker volumes**: if you also want a raw volume-level backup of
  `mongo_data`, `docker run --rm -v mongo_data:/data -v $(pwd):/backup
  alpine tar czf /backup/mongo_data_$(date +%F).tar.gz /data` while the
  container is briefly stopped, or use a proper hot-backup tool for
  MongoDB instead of tarring a live data directory.

This template does not automate backups — implement and test one
appropriate to your data's actual value before going live.

## 3. GitHub configuration

### 3.1 Secrets (Settings → Environments → `production` → Secrets)

| Secret | Description |
|---|---|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_PORT` | SSH port (usually `22`) |
| `VPS_USER` | `deploy` (the dedicated user from §2.3) |
| `VPS_SSH_PRIVATE_KEY` | Private half of the key from §2.4 |
| `VPS_DEPLOY_PATH` | e.g. `/srv/apps/myapp` |

Using a GitHub **Environment** named `production` (rather than plain
repository secrets) means these are never visible to `pull_request`
workflow runs, and lets you optionally add required reviewers for
extra protection on top of the pipeline's own gating.

### 3.2 Variables (Settings → Secrets and variables → Actions → Variables)

These are non-secret and safe to see in logs:

| Variable | Default if unset | Purpose |
|---|---|---|
| `CLIENT_DIR` | `client` | Frontend workspace folder |
| `SERVER_DIR` | `server` | Backend workspace folder |
| `NODE_VERSION_DEFAULT` | `22` | Used only if no `.nvmrc` is found |
| `VITE_API_URL` | `/api` | Baked into the frontend build (not a secret) |

## 4. First deployment

1. Complete §2.1–2.11 above.
2. Push to `main` (or run the workflow manually via
   **Actions → Production CI/CD → Run workflow**).
3. Watch the `deploy` job. `deploy.sh` will log
   `No previous deployment found. This looks like the first deployment.`
   — that's expected and not an error; rollback is only attempted once
   at least one deployment has succeeded.
4. On success, `.deployment/current` on the VPS records the deployed
   tag, commit, and timestamp.

## 5. Rollback

**Automatic**: if a deployment's health check fails, `deploy.sh`
immediately attempts to redeploy `.deployment/previous` and health-checks
that too. The GitHub Actions job still ends with a failure so CI
accurately reflects that the attempted deployment failed, even though
the previous version is back up.

**Manual**: SSH to the VPS and run, from the deploy path:

```bash
./deployment/scripts/rollback.sh                # roll back to .deployment/previous
./deployment/scripts/rollback.sh sha-8f31c8a     # roll back to a specific historical tag
```

Past tags are listed in `.deployment/history.log`.

## 6. Image cleanup

Not run automatically as part of deployment (deployment should stay
fast and side-effect-free beyond the deploy itself). Schedule it
separately, e.g. a weekly cron job on the VPS:

```bash
# /etc/cron.d/myapp-image-cleanup
0 4 * * 0 deploy DEPLOY_PATH=/srv/apps/myapp IMAGE_REPOSITORIES="ghcr.io/org/myapp-server ghcr.io/org/myapp-client" KEEP_IMAGE_VERSIONS=5 /srv/apps/myapp/deployment/scripts/cleanup-images.sh >> /var/log/myapp-cleanup.log 2>&1
```

Run with `DRY_RUN=true` first to preview what would be removed.

## 7. Security review

| Control | How it's satisfied |
|---|---|
| Immutable image deployment | `sha-<commit>` tag only; `latest` is convenience-only, never deployed |
| No secrets in Git | `.env` is git-ignored; `.env.example` holds no real values |
| No secrets in the Docker image | `.dockerignore` excludes `.env`; secrets are injected via `env_file` at container runtime, not build time |
| Least-privilege GitHub permissions | Workflow-level `permissions: contents: read, packages: write` |
| GitHub Environment for production secrets | `deploy` job uses `environment: production` |
| SSH key authentication | Dedicated ed25519 key, no passwords |
| No root SSH | Dedicated `deploy` user in the `docker` group |
| No secrets exposed to PRs | `docker`/`deploy` jobs are gated to `push`/`workflow_dispatch` on `main` only; `pull_request` never reaches them; no `pull_request_target` used anywhere |
| No public MongoDB | No `ports:` published for the `mongo` service |
| No credentials in logs | Scripts never `echo`/print secret values; only tag names, paths, and timestamps are logged |
| No unsafe Docker cleanup | `cleanup-images.sh` never runs `system prune -a`; only touches listed repositories; never removes the current or previous tag |
| No destructive DB operations | Deployment never runs `docker compose down -v`; the `mongo_data` volume is never touched by deploy/rollback |

## 8. Production readiness checklist

- [ ] VPS hardened: dedicated `deploy` user, SSH key auth only, firewall enabled
- [ ] Docker + Compose v2 installed and verified
- [ ] GHCR authentication configured on the VPS (or package made public)
- [ ] `/srv/apps/<project>` created, owned by `deploy`
- [ ] Real `.env` created on the VPS with strong secrets, never committed
- [ ] Health endpoint verified: `curl http://localhost:<port>/api/health` returns 200
- [ ] `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_PRIVATE_KEY`, `VPS_DEPLOY_PATH` set under the `production` GitHub Environment
- [ ] `CLIENT_DIR` / `SERVER_DIR` / `NODE_VERSION_DEFAULT` variables set if this project's layout differs from the defaults
- [ ] First deployment run and verified manually (containers healthy, app reachable)
- [ ] Manual rollback tested at least once in a non-production window
- [ ] MongoDB (or external DB) backup scheduled and a restore has been test-run
- [ ] Image cleanup cron job scheduled
- [ ] Traefik network name (or standalone override) confirmed correct in `.env`
