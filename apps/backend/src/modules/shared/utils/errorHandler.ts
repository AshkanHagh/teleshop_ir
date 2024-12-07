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
        : new ErrorHandler(
            500, 
            "Unknown", 
            (error as Error)?.message || "An unknown error occurred", 
            "Internal Server Error"
        );

    logger.error(`An error occurred: kind: ${handledError.kind}, message: ${handledError.developMessage}. ${handledError.message}`);
    
    return context.json(
        {
            success: false, 
            message: handledError.clientMessage ?? "An unexpected error occurred", 
            kind: handledError.kind ?? "Unknown"
        }, 
        handledError.statusCode ?? 500
    );
};

export default ErrorHandler