ARG NODE_VERSION=22-alpine

# ---- Dependencies ----
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

COPY package*.json ./

RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi


# ---- Runtime ----
FROM node:${NODE_VERSION} AS runtime

ENV NODE_ENV=production

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application
COPY . .

# Copy entrypoint
COPY entrypoint.sh /app/entrypoint.sh

# IMPORTANT:
# Make entrypoint executable and owned by appuser
RUN chmod 755 /app/entrypoint.sh && \
    chown appuser:appgroup /app/entrypoint.sh

USER appuser

EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]