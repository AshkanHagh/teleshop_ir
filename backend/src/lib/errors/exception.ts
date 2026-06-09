import errorType from "./error-type.js";

export interface AppError extends Error {
  statusCode: number;
}

export function AppError(message: string, status: number, cause?: unknown) {
  const error = new Error(message) as AppError;
  error.statusCode = status;
  error.cause = cause;
  return error;
}
