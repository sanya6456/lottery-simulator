# Stage 1: Base
FROM node:24-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Stage 2: Development
FROM base AS development

ENV NODE_ENV=development

EXPOSE 3000

CMD ["pnpm", "start:dev"]

# Stage 3: Build
FROM base AS builder

RUN pnpm build

# Stage 3: Production
FROM node:24-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]
