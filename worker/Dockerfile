FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY src ./src
COPY init-db.js ./

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Worker has no HTTP port — it's a background consumer
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD pgrep -f "node src/index.js" || exit 1

CMD ["node", "src/index.js"]
