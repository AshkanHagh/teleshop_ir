import fp from "fastify-plugin";
import AutoLoad from "@fastify/autoload";
import { Bot } from "grammy";
import { FastifyPlugin } from "src/lib/fastify/constants.js";
import { join } from "node:path";

declare module "fastify" {
  interface FastifyInstance {
    bot: Bot;
  }
}

export default fp(
  async (fastify) => {
    fastify.decorate("bot", new Bot(fastify.config.TELEGRAM_BOT_TOKEN));
    await fastify.register(AutoLoad, {
      dir: join(import.meta.dirname, "..", "modules/telegram"),
      forceESM: true,
    });
  },
  {
    dependencies: [FastifyPlugin.Env],
  },
);
