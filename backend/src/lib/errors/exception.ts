import { captureException } from "@sentry/node";
import { fastify } from "src/app.js";

export interface AppError extends Error {
  statusCode: number;
}

export function AppError(message: string, status: number, cause?: unknown) {
  const error = new Error(message) as AppError;
  error.statusCode = status;
  error.cause = cause;
  return error;
}

export function WsError(socket: WebSocket, message: string, status: string) {
  socket.send(
    JSON.stringify({
      event: "error",
      data: {
        message,
        statusCode: status,
      },
    }),
  );
}

export function logError(error: Error, type: string) {
  if (process.env.NODE_ENV === "production") {
    captureException(error);
  } else {
    fastify.log.error({
      type,
      message: error.message,
      name: error.name,
      cause: error.cause ?? error,
    });
  }
}
