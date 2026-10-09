ARG NODE_VERSION=22-alpine

# ---- Dependencies ----
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


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
RUN sed -i 's/\r$//' /app/entrypoint.sh && \
    chmod 755 /app/entrypoint.sh && \
    mkdir -p /app/uploads /app/logs && \
    chown -R appuser:appgroup /app/uploads /app/logs

USER appuser

EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]
