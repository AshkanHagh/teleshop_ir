import fp from "fastify-plugin";
import { FastifyPlugin } from "src/lib/fastify/constants.js";

export default fp(
  async (fastify) => {
    await fastify.register(import("@fastify/cors"), {
      origin: fastify.config.CORS_ORIGIN,
      credentials: true,
    });
  },
  {
    dependencies: [FastifyPlugin.Env],
  },
);
