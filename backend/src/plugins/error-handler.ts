import fp from "fastify-plugin";
import errorType from "src/lib/errors/error-type.js";
import { AppError } from "src/lib/errors/exception.js";

const ALLOWED_STATUSES = [404, 501, 502, 503];

export default fp(async (fastify) => {
  fastify.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({ statusCode: "404", message: errorType.NOT_FOUND });
  });

  fastify.setErrorHandler((error: AppError, request, reply) => {
    const isProd = process.env.NODE_ENV === "production";
    const status = error.statusCode || 500;

    if (!isProd) {
      request.log.error({
        type: "http",
        message: error.message,
        name: error.name,
        cause: error.cause ?? error,
        status_code: status,
      });
    }
    const message = ALLOWED_STATUSES.includes(status)
      ? error.message
      : // error.statusCode is set when the error is instanceof apperror
        error.statusCode
        ? error.message
        : errorType.INTERNAL_SERVER_ERROR;

    reply.status(status).send({
      statusCode: status.toString(),
      message,
    });
  });
});
