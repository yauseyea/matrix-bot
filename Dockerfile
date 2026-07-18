# Build stage
FROM node:26-bookworm-slim AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

# Run stage
FROM node:26-bookworm-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -d /app -s /usr/sbin/nologin -M nodejs
COPY package*.json ./
RUN npm install --production
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
RUN mkdir -p /app/logs /app/tmp && \
    touch /app/bot-storage.json && \
    chown -R nodejs:nodejs /app/logs /app/tmp /app/bot-storage.json
USER nodejs
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:9000/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]