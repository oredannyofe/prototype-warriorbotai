# syntax=docker/dockerfile:1
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci || npm install

FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_API_URL can be set at runtime; default to /api for same-origin proxy
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only needed files
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json ./package.json

EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
