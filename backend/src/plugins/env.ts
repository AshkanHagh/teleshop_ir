import fp from "fastify-plugin";
import { z } from "zod/v3";
import { zodToJsonSchema } from "zod-to-json-schema";
import { FastifyPlugin } from "src/lib/fastify/constants.js";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(6610),
  NODE_ENV: z.enum(["production", "development"]).default("development"),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  CORS_ORIGIN: z.string(),
  TELEGRAM_BOT_TOKEN: z.string(),
  NOBITEX_API: z.string(),
  ZARINPAL_MERCHANT_ID: z.string(),
  PAYMENT_REDIRECT_URL: z.string(),
  COOKIE_SECRET: z.string(),
});

declare module "fastify" {
  interface FastifyInstance {
    config: z.infer<typeof EnvSchema>;
  }
}

export default fp(
  async (fastify) => {
    await fastify.register(import("@fastify/env"), {
      schema: zodToJsonSchema(EnvSchema),
    });
  },
  { name: FastifyPlugin.Env },
);
