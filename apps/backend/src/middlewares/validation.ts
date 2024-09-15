import { z, ZodSchema } from 'zod';
import type { Context, Next } from 'hono';
import { createValidationError } from '../utils';

export type RequestEntries = 'json' | 'param' | 'query';
export type ValidationFuncs<T> = {[K in RequestEntries]? : T}

declare module 'hono' {
    interface HonoRequest {
        validated : ValidationFuncs<unknown>
    }
}

export const validationMiddleware = <S>(source : RequestEntries, schema : ZodSchema) => {
    return async (context : Context, next : Next) => {
        // @ts-expect-error // type bug
        const data = await context.req[source]();
        const handelValidation : Record<RequestEntries, 
        (data : S, schema : ZodSchema<S>) => Promise<z.SafeParseReturnType<unknown, unknown>>> = {
            json : validate, query : validate, param : validate
        };

        const validationResult = await handelValidation[source](data, schema);
        if (!validationResult.success) throw createValidationError(validationResult.error?.issues[0].message);
        context.req.validated = {
            [source] : validationResult.data as z.infer<typeof schema>
        };
        await next();
    };
}

const validate = async (data : unknown, schema : ZodSchema) : Promise<z.SafeParseReturnType<unknown, unknown>> => {
    return schema.safeParse(data)
};