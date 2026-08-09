# syntax=docker/dockerfile:1

# ── Stage 1: Install dependencies ──────────────────────────────────
FROM node:24-alpine AS installer
WORKDIR /app
ENV CI=true
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# ── Stage 2: Development (includes all deps + source) ──────────────
FROM node:24-alpine AS dev
WORKDIR /app
ENV CI=true NODE_ENV=development
COPY --from=installer /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=installer /app/node_modules ./node_modules
COPY . .
RUN corepack enable
EXPOSE 5173

# ── Stage 3: Build for production ──────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
ENV CI=true
COPY --from=installer /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=installer /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build && pnpm prune --prod

# ── Stage 4: Production image ──────────────────────────────────────
FROM node:24-alpine AS app
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder --chown=appuser:appgroup /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/build ./build

# Copy config and schema
COPY ./drizzle.config.ts ./
COPY ./drizzle ./drizzle

USER appuser
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "build"]
