FROM oven/bun:1.1.29-alpine

RUN apk --no-cache add curl

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

EXPOSE 6610

CMD ["sh", "run.sh"]