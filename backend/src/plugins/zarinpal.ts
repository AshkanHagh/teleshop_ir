import fp from "fastify-plugin";
import { FastifyPlugin } from "src/lib/fastify/constants.js";
import { createWithOptions, ZarinPalCheckout } from "zarinpal-checkout";

declare module "fastify" {
  interface FastifyInstance {
    zarinpal: ZarinPalCheckout;
  }
}

export default fp(
  async (fastify) => {
    fastify.decorate("zarinpal");
    fastify.zarinpal = createWithOptions(fastify.config.ZARINPAL_MERCHANT_ID, {
      sandbox: fastify.config.NODE_ENV !== "production",
      currency: "IRR",
    });
  },
  { dependencies: [FastifyPlugin.Env] },
);
