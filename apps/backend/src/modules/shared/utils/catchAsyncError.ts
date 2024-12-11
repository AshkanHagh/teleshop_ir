import type { Context, Next } from "hono";
import ErrorHandler from "@shared/utils/errorHandler";

type AsyncRequestHandler<T> = (context: Context, next : Next) => T;

export const CatchAsyncError = <T>(theFunc: AsyncRequestHandler<T>) => (context: Context, next: Next) => {
    return Promise.resolve(theFunc(context, next)).catch((error: ErrorHandler) => {
        console.log(error);
        throw new ErrorHandler(error.message, error.statusCode);
    });
};