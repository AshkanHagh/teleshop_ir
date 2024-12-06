import { z, ZodSchema } from "zod";
import type { Context, Next } from "hono";
import ErrorFactory from "@shared/utils/customErrors";
import ErrorHandler from "@shared/utils/errorHandler";
import type { SelectUser } from "@shared/models/user.model";

const _ = ["json", "param", "query"] as const;
export type RequestEntries = typeof _[number];
export type ValidationFuncs<T> = {[K in RequestEntries]?: T}

declare module "hono" {
    interface ContextVariableMap<T = unknown> extends Record<RequestEntries, T> {
        user: SelectUser;
    }
}

type ReqSourceMapParsing<Source> = Record<
        RequestEntries, 
        (reqPayload: Source, schema: ZodSchema<Source>) => z.SafeParseReturnType<unknown, unknown>
    >

export const validationPayload = <Source>(source: RequestEntries, schema: ZodSchema) => {
    return async (context: Context, next: Next) => {
        try {
            // @ts-expect-error // type bug
            const reqPayload = await context.req[source]();

            const safeParse = (): z.SafeParseReturnType<unknown, unknown> => schema.safeParse(reqPayload);
            const reqSourceMap: ReqSourceMapParsing<Source> = {
                json: safeParse, query: safeParse, param: safeParse
            };
    
            const validatedReqPayload = reqSourceMap[source](reqPayload, schema);

            if (!validatedReqPayload.success) {
                throw ErrorFactory.ValidationError(validatedReqPayload.error?.issues[0].message);
            }

            context.set(source, validatedReqPayload.data as z.infer<typeof schema>)
            await next();
            
        } catch (err: unknown) {
            const error: ErrorHandler = err as ErrorHandler;
            throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
        }
    };
}