FROM oven/bun:1.1.38 AS build

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile --production

COPY . .

ENTRYPOINT ["bun", "run", "start"]