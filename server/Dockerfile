# syntax=docker/dockerfile:1
#
# Production image for the Express/Node.js API.
#
# Assumes a plain JavaScript backend with no compile step (the common case
# for Express APIs). If this project uses TypeScript instead:
#   1. Add a `deps-dev` stage that runs `npm ci` (with dev deps) + `npm run build`
#   2. In the runtime stage, COPY the compiled `dist/` output instead of `.`
#   3. Change the CMD to run the compiled entrypoint (e.g. `dist/server.js`)
# See docs/adopting-this-template.md for a ready-to-paste TypeScript variant.

ARG NODE_VERSION=22-alpine

# ---- Dependencies (production only) ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package*.json ./
# Prefer the lockfile-aware, reproducible install. If this project uses
# yarn or pnpm instead of npm, swap the line below accordingly:
#   yarn:  RUN yarn install --frozen-lockfile --production
#   pnpm:  RUN corepack enable && pnpm install --frozen-lockfile --prod
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; \
    else npm install --omit=dev; fi

# ---- Runtime ----
FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Run as a non-root user rather than the image's default root.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
# .dockerignore keeps .env, .git, tests, and node_modules out of this COPY.
COPY . .

USER appuser
EXPOSE 3000

# Verify this matches the project's actual "scripts.start" in package.json.
CMD ["node", "src/server.js"]
