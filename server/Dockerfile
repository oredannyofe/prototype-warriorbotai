# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
# system deps for prisma on alpine
RUN apk add --no-cache openssl libc6-compat python3 make g++
COPY package.json package-lock.json* ./
# Install dev deps for build (use ci if lock exists)
RUN if [ -f package-lock.json ]; then npm ci --no-audit --fund=false; else npm install --no-audit --fund=false; fi

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat python3 make g++
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl libc6-compat
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# prune dev deps to shrink image
RUN npm prune --omit=dev --no-audit --fund=false || true
# Default port
EXPOSE 4000
CMD ["sh","-c","node -v && npx prisma migrate deploy && node dist/main.js"]
