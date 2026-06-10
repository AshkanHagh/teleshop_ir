import "dotenv/config";
import "./lib/traces/instrument.js";
import Fastify from "fastify";
import AutoLoad from "@fastify/autoload";
import { join } from "node:path";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import closeWithGrace from "close-with-grace";
import { setupFastifyErrorHandler } from "@sentry/node";

export const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: false,
              ignore: "pid,hostname,component,msg",
            },
          }
        : undefined,
  },
  disableRequestLogging: true,
});

async function app() {
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  if (process.env.NODE_ENV === "production") {
    setupFastifyErrorHandler(fastify);
  }
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, "plugins"),
    forceESM: true,
  });
  // This loads all plugins defined in routes
  // define your routes in one of these
  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, "routes"),
    options: { prefix: "/api/" },
    routeParams: true,
    forceESM: true,
  });

  closeWithGrace(async function ({ err, signal }) {
    if (err) {
      fastify.log.error({
        message: "server closing with error",
        error: err,
      });
    } else {
      fastify.log.info(`${signal} received, server closing`);
    }
    await fastify.close();
  });

  await fastify.listen({ port: fastify.config.PORT });
}
app();
