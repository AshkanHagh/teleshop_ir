import type { Context, Next } from 'hono';
import ErrorHandler from '../utils/errorHandler';
import { createAccessTokenInvalidError, createForbiddenError, createInitializingRequiredError } from '../utils';
import type { InitialRoles, SelectUser } from '../models/schema';
import { decodeToken } from '../utils/jwt';
import { validationZodSchema } from '../utils/validation';
import { bearerTokenSchema } from '../schemas/zod.schema';
import { prefixUserCachedDetail } from '../services/auth.service';
import { hgetall } from '../database/cache';

export const isAuthenticated = async (context : Context, next : Next) : Promise<void> => {
    try {
        const bearerToken : string | undefined = context.req.header('authorization');
        const validatedBearerToken : string = validationZodSchema(bearerTokenSchema, bearerToken) as string;
        const accessToken : string = validatedBearerToken.split(' ')[1];

        const decodedToken : SelectUser = decodeToken(accessToken, process.env.ACCESS_TOKEN) as SelectUser;
        if(!decodedToken) throw createAccessTokenInvalidError();

        const currentUser : SelectUser = prefixUserCachedDetail(await hgetall(`user:${decodedToken.id}`));
        if(!currentUser || !Object.keys(currentUser).length) throw createInitializingRequiredError();
        context.set('user', currentUser);
        next();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const authorizedRoles = (authorizedRole : InitialRoles) :  (context: Context, next: Next) => void => {
    return (context : Context, next : Next) => {
        const { role } = context.get('user') as SelectUser;
        if(!authorizedRole.includes(role)) throw createForbiddenError();
        next();
    }
}