FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
COPY apps/mobile/patches apps/mobile/patches
COPY packages/backend/package.json packages/backend/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY . .
RUN cd apps/web && rm -rf convex && cp -r ../../packages/backend/convex ./convex
ARG CONVEX_URL
ENV CONVEX_URL=${CONVEX_URL}
RUN pnpm --filter web build

FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app ./

WORKDIR /app/apps/web
EXPOSE 3016
ENV PORT=3016
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "run", "start"]
