import fp from "fastify-plugin";
import { Bot } from "grammy";
import { FastifyPlugin } from "src/lib/fastify/constants.js";

declare module "fastify" {
  interface FastifyInstance {
    bot: Bot;
  }
}

export default fp(
  async (fastify) => {
    fastify.decorate("bot", new Bot(fastify.config.TELEGRAM_BOT_TOKEN));
  },
  {
    dependencies: [FastifyPlugin.Env],
  },
);
