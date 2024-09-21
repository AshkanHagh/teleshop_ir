import type { Context, Next } from 'hono';
import ErrorHandler from './errorHandler';

type AsyncRequestHandler<T> = (context : Context, next  : Next) => T;

export const CatchAsyncError = <T>(theFunc : AsyncRequestHandler<T>) => (context : Context, next : Next) => {
    return Promise.resolve(theFunc(context, next)).catch((error : ErrorHandler) => {
        throw new ErrorHandler(error.message, error.statusCode, error.cause);
        // const errorCause = error.cause ? error.cause : 'Internal server error';
        // const errorStatusCode
        // return context.json({success : false, message : error.message, cause : errorCause}, error.statusCode);
    });
};