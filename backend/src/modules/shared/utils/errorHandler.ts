import { logger } from "@shared/libs/winston";
import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

class ErrorHandler extends Error {
  statusCode: StatusCode;

  constructor(message: string, statusCode: StatusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
export const ErrorMiddleware = async (error: unknown, context: Context) => {
  const handledError: ErrorHandler =
    error instanceof ErrorHandler
      ? error
      : new ErrorHandler("An error occurred : Internal Server Error", 500);

  logger.warn(handledError.message, handledError.statusCode);

  return context.json(
    { success: false, message: handledError.message },
    handledError.statusCode,
  );
};

export default ErrorHandler;
