import type { Context, Next } from 'hono';
import ErrorHandler from '../utils/errorHandler';
import type { InitRoles, SelectUser } from '../types';
import { decodeToken } from '../utils/jwt';
import { validationZodSchema } from '../utils/validation';
import { bearerToken } from '../schemas/zod.schema';
import redis from '../libs/redis.config';
import { usersKeyById } from '../utils/keys';
import { CatchAsyncError } from './catchAsyncError';
import ErrorFactory from '../utils/customErrors';
import { env } from '../../env';

export const isAuthenticated = async (context : Context, next : Next) : Promise<void> => {
    try {
        const bearer : string | undefined = context.req.header('authorization');
        const validatedBearerToken : string = validationZodSchema(bearerToken, bearer) as string;
        const accessToken : string = validatedBearerToken.split(' ')[1];

        const userTokenDetail = decodeToken(accessToken, env.ACCESS_TOKEN) as SelectUser;
        if(!userTokenDetail) throw ErrorFactory.AccessTokenInvalidError();

        const currentUserCache = await redis.json.get(usersKeyById(userTokenDetail.id), '$') as SelectUser[] | null;
        if(!currentUserCache || !currentUserCache.length) throw ErrorFactory.InitRequiredError();
        context.set('user', currentUserCache[0]);
        await next();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const authorizedRoles = (...authorizedRoles : InitRoles) => {
    return CatchAsyncError(async (context : Context, next : Next) => {
        const { roles } = context.get('user') as SelectUser;
        if(!authorizedRoles.some(authorizedRole => roles.some(role => authorizedRole === role))) {
            throw ErrorFactory.UnAuthorizedRoleError(roles.join(' '))
        };
        await next();
    })
}