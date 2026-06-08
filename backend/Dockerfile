FROM registry.docker.ir/oven/bun:1.1.38 AS build

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --no-cache

COPY . .

ENTRYPOINT ["bun", "run", "start"]
