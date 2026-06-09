import fp from "fastify-plugin";
import { FastifyPlugin } from "src/lib/fastify/constants.js";
import { createWithOptions } from "zarinpal-checkout";

declare module "fastify" {
  interface FastifyInstance {
    // @ts-expect-error i dont care
    zarinpal: ZarinPal;
  }
}

export default fp(
  async (fastify) => {
    fastify.decorate("zarinpal");
    fastify.zarinpal = createWithOptions(fastify.config.ZARINPAL_MERCHANT_ID, {
      sandbox: fastify.config.NODE_ENV === "production",
      currency: "IRT",
    });
  },
  { dependencies: [FastifyPlugin.Env] },
);
