# ---- Base ----
FROM node:24-alpine AS base
WORKDIR /usr/src/app
ENV NODE_ENV=production

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Runtime ----
FROM base AS runtime
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN mkdir -p logs && chown -R nodeuser:nodejs /usr/src/app
USER nodeuser

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
