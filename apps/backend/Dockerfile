FROM oven/bun:1.1.27-alpine

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

EXPOSE 7319

CMD ["sh", "run.sh"]