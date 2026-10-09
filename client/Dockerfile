# syntax=docker/dockerfile:1
#
# Production image for the Vite/React frontend.
# Multi-stage: build static assets with Node, then serve them with Nginx.
#
# If this project uses Create React App or Next.js instead of Vite, see
# docs/adopting-this-template.md for the adjusted build stage (CRA needs
# `npm run build` -> `build/` instead of `dist/`; Next.js needs a Node
# runtime stage instead of static Nginx unless it's statically exported).

ARG NODE_VERSION=22-alpine

# ---- Build ----
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build-time variables get baked into the static bundle at build time.
# These are NOT secrets — never put runtime secrets (JWT_SECRET, MONGO_URI)
# here; they belong on the server container only.
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_SOCKET_URL=/
ARG VITE_SITE_NAME="Affiliate Hub"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}
ENV VITE_SITE_NAME=${VITE_SITE_NAME}

RUN npm run build

# ---- Runtime ----
# Pin an explicit Nginx version — check hub.docker.com/_/nginx for the
# current stable line when adopting this template into a new project.
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
