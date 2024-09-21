FROM oven/bun:1.1.27-alpine

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

EXPOSE 6610

CMD ["sh", "run.sh"]