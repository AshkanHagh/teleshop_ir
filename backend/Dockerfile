FROM ghcr.io/pnpm/pnpm:11 AS base
RUN pnpm runtime set node 22 -g

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 7319
CMD [ "pnpm", "start" ]
