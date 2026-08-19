# Adopting This Template Into a Project

This template is deliberately generic. Before wiring it into a real
repository, spend five minutes inspecting that repository — don't
assume it matches the defaults below.

## 1. Inspect the target repo first

```bash
cat package.json 2>/dev/null                 # root-level? monorepo?
cat client/package.json server/package.json 2>/dev/null
ls .nvmrc client/.nvmrc server/.nvmrc 2>/dev/null
cat client/package.json | grep -A3 '"scripts"'
cat server/package.json | grep -A3 '"scripts"'
ls docker-compose*.yml Dockerfile client/Dockerfile server/Dockerfile 2>/dev/null
grep -rn "health" server/ --include=*.js -l 2>/dev/null | head
```

Answer these before changing anything:

- Are the frontend/backend folders actually named `client`/`server`? If
  not, set the `CLIENT_DIR`/`SERVER_DIR` repository variables (§3 of
  `deployment.md`) — nothing in the workflow needs to be edited for a
  simple rename.
- npm, yarn, or pnpm? Detected automatically at CI time from the
  lockfile present — no changes needed either way.
- Does `.nvmrc` exist? Used automatically if present, at the repo root
  or inside `server/`.
- Does a health endpoint already exist? If yes, point `HEALTH_PATH` /
  `HEALTH_PORT` at it. If no, add the minimal one shown in
  `deployment.md` §2.10.
- Does this project already have working Dockerfiles or a
  `docker-compose.yml`? **Prefer modifying them over replacing them** —
  only borrow the parts of this template that add missing production
  concerns (multi-stage build, non-root user, `.dockerignore`,
  healthcheck, immutable tag).

## 2. Frontend framework differences

This template assumes **Vite** (`npm run build` → `dist/`). Adjust
`client/Dockerfile` if the project uses something else:

**Create React App** (`npm run build` → `build/`):
```dockerfile
RUN npm run build
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/build /usr/share/nginx/html   # note: build, not dist
```

**Next.js**: if using `output: 'export'` (static export), same pattern
as CRA but copy `/app/out`. If using SSR/ISR, Next.js needs a Node
runtime, not static Nginx — replace the `runtime` stage with:
```dockerfile
FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
```
and drop the Nginx-proxy service split in `docker-compose.yml` in
favor of a single service (or keep Nginx purely as the edge/Traefik
layer, proxying straight to Next's Node server).

## 3. Backend build step (TypeScript, etc.)

`server/Dockerfile` assumes plain JavaScript with no compile step. If
the backend uses TypeScript (or any `build` script that must run
before start):

```dockerfile
ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS build
COPY . .
RUN npm run build

FROM node:${NODE_VERSION} AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Also confirm the actual entrypoint filename (`server.js`, `index.js`,
`src/index.js`, `dist/main.js`, ...) against `package.json`'s
`"scripts.start"` and match the Dockerfile `CMD` to it exactly — never
guess.

## 4. Ports

Both Dockerfiles and `docker-compose.yml` assume the backend listens
on `3000`. If the real app uses a different port (check
`process.env.PORT` usage or an existing `.env.example`), update:

- `server/Dockerfile`: `EXPOSE <port>`
- `docker-compose.yml`: the server healthcheck URL
- `client/nginx.conf`: the `proxy_pass` target
- `.env` on the VPS: `PORT=<port>`

## 5. MongoDB: in Compose vs external

The default `docker-compose.yml` runs Mongo as a Compose service with
a named volume. If the target project uses MongoDB Atlas or another
managed instance instead:

1. Delete the `mongo:` service block and the `mongo_data` volume from
   `docker-compose.yml`.
2. Set `MONGO_URI` in `.env` on the VPS to the external connection
   string.
3. Remove the Mongo-specific line from the backup section of
   `deployment.md` (the managed provider handles backups).

## 6. Socket.IO / WebSockets

If the backend uses Socket.IO or raw WebSockets, uncomment the
`/socket.io/` location block in `client/nginx.conf` (and adjust the
path if the app mounts it elsewhere), and confirm Traefik's
`websecure` entrypoint (already the default here) supports the
upgrade — it does out of the box.

## 7. Verify before wiring up CI

Before touching GitHub at all, prove the containers work locally:

```bash
cp .env.example .env   # fill in local values
docker compose build
IMAGE_TAG=local docker compose config -q   # validates the compose file
```

(For a full local run you'd normally `docker compose up` against
locally-built images — building against `ghcr.io/...:${IMAGE_TAG}`
directly only works once that tag has actually been pushed.)

## 8. Copy checklist for a new project

- [ ] Copy `.github/workflows/ci-cd.yml`, `deployment/`, `docker-compose.yml`,
      `docker-compose.override.example.yml`, `.env.example`, `docs/`
- [ ] Copy `client/Dockerfile`, `client/.dockerignore`, `client/nginx.conf`
      into the project's frontend folder (adjust per §2 if not Vite)
- [ ] Copy `server/Dockerfile`, `server/.dockerignore` into the
      project's backend folder (adjust per §3 if not plain JS)
- [ ] Set `CLIENT_DIR`/`SERVER_DIR` repo variables if folder names differ
- [ ] Confirm/add the health endpoint (§2.10 of `deployment.md`)
- [ ] Confirm ports match (§4 above)
- [ ] Decide Mongo-in-Compose vs external (§5 above)
- [ ] Follow `deployment.md` end-to-end for the actual VPS setup
