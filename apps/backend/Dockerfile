FROM oven/bun:1.1.30 AS builder

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile --production

COPY . .

RUN bun run build

FROM scratch

WORKDIR /app

COPY --from=builder /app/bin .

EXPOSE 6610

CMD ["/main"]