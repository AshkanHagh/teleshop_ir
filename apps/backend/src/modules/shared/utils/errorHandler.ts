import { logger } from "@shared/libs/winston";
import type { Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";

type ErrorKind = 
    "QueryFailed" | "ConnectionFailed" | "Client" | 
    "Unhandled" | "Parsing" | "Unknown" | 
    "Authorization" | "Server" | "Authentication" |
    "Payment"

class ErrorHandler extends Error {
    public statusCode: StatusCode;
    public kind: ErrorKind;
    public clientMessage: string;
    public developMessage: string;

    constructor(
        statusCode: StatusCode = 500,
        kind: ErrorKind = "Unknown",
        developMessage: string,
        clientMessage: string = "An unexpected error occurred"
    ) 
    {
        super(developMessage);
        this.statusCode = statusCode;
        this.kind = kind;
        this.developMessage = developMessage;
        this.clientMessage = clientMessage;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const ErrorMiddleware = async (error: unknown, context: Context) => {
    const handledError = error instanceof ErrorHandler
        ? error
        : new ErrorHandler(500, "Unhandled", (error as Error)?.message || "Unknown error", "Internal Server Error");

    logger.error(`An error occurred: kind: ${handledError.kind}, message: ${handledError.message}`);
    console.log(error);
    
    return context.json(
        {
            success: false, 
            message: handledError.clientMessage, 
            kind: handledError.kind
        }, 
        handledError.statusCode
    );
};

export default ErrorHandler