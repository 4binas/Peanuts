FROM node:24-alpine AS installer

WORKDIR /build
ENV CI=true

COPY ./pnpm-lock.yaml ./package.json ./pnpm-workspace.yaml ./

RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=installer /build /app

ENV CI=true

RUN pnpm build && pnpm prune --prod

FROM node:24-alpine AS app
WORKDIR /app
COPY --from=installer /build/package.json /build/pnpm-lock.yaml /app/
COPY --from=installer /build/node_modules /app/node_modules
COPY --from=builder /build/build /app/build

CMD ["node", "build"]
