import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { webhookCallback } from "grammy";

const telegramRoute: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post(
    "/telegram/webhooks",
    webhookCallback(fastify.bot, "fastify", {
      secretToken: fastify.config.TELEGRAM_WEBHOOK_SECRET,
    }),
  );
};

export default telegramRoute;
