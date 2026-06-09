import fp from "fastify-plugin";
import { FastifyPlugin } from "src/lib/fastify/constants.js";

export default fp(
  async (fastify) => {
    await fastify.register(import("@fastify/helmet"));
  },
  { name: FastifyPlugin.Helmet },
);
