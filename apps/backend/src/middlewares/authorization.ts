import type { Context, Next } from 'hono';
import ErrorHandler from './errorHandler';
import { createAccessTokenInvalidError, createForbiddenError, createInitializingRequiredError } from '../utils';
import type { DrizzleSelectUser, InitialRoles } from '../models/schema';
import { decodeToken } from '../utils/jwt';
import { validationZodSchema } from '../utils/validation';
import { bearerTokenSchema } from '../schemas/zod.schema';
import redis from '../libs/redis.config';
import { usersKeyById } from '../utils/keys';
import { CatchAsyncError } from './catchAsyncError';

export const isAuthenticated = async (context : Context, next : Next) : Promise<void> => {
    try {
        const bearerToken : string | undefined = context.req.header('authorization');
        const validatedBearerToken : string = validationZodSchema(bearerTokenSchema, bearerToken) as string;
        const accessToken : string = validatedBearerToken.split(' ')[1];

        const userTokenDetail = decodeToken(accessToken, process.env.ACCESS_TOKEN) as DrizzleSelectUser;
        if(!userTokenDetail) throw createAccessTokenInvalidError();

        const currentUserCache = await redis.json.get(usersKeyById(userTokenDetail.id), '$') as DrizzleSelectUser[] | null;
        if(!currentUserCache || !currentUserCache.length) throw createInitializingRequiredError();
        context.set('user', currentUserCache[0]);
        await next();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const authorizedRoles = (authorizedRole : InitialRoles) => {
    return CatchAsyncError(async (context : Context, next : Next) => {
        const { role } = context.get('user') as DrizzleSelectUser;
        if(!authorizedRole.includes(role)) throw createForbiddenError();
        await next();
    })
}