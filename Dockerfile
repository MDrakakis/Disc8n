FROM node:alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci 

COPY tsconfig.json ./
COPY src ./src
COPY commands.json ./commands.json

RUN npm run build

FROM node:alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app \
    && mkdir -p /app/logs \
    && chown -R app:app /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

USER app

CMD ["node", "dist/index.js"]
