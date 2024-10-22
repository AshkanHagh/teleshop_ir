import type { Context, Next } from 'hono';
import ErrorHandler from '@utils/errorHandler';
import type { InitRoles, SelectUser } from '@types';
import { decodeToken, validationZodSchema, usersKeyById } from '@utils/.';
import { bearerToken } from '../schemas/zod.schema';
import { CatchAsyncError } from './catchAsyncError';
import ErrorFactory from '@utils/customErrors';
import { env } from '@env';
import RedisMethod from '@cache/.';

export const isAuthenticated = async (context : Context, next : Next) : Promise<void> => {
    try {
        const bearer : string | undefined = context.req.header('authorization');
        const validatedBearerToken : string = validationZodSchema(bearerToken, bearer) as string;
        const accessToken : string = validatedBearerToken.split(' ')[1];

        const userTokenDetail = await decodeToken(accessToken, env.ACCESS_TOKEN) as SelectUser & {exp : number};
        if(!userTokenDetail) throw ErrorFactory.AccessTokenInvalidError();

        const currentUserCache = await RedisMethod.jsonget(usersKeyById(userTokenDetail.id), '$') as 
        (SelectUser & {exp : number})[] | null;
        if(!currentUserCache || !currentUserCache.length) throw ErrorFactory.InitRequiredError();
        const { exp, ...rest } = currentUserCache[0];
        context.set('user', rest);
        await next();

    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.message, error.statusCode, 'An error occurred');
    }
}

export const authorizedRoles = (...authorizedRoles : InitRoles) => {
    return CatchAsyncError(async (context : Context, next : Next) => {
        const { roles } = context.get('user');
        if(!authorizedRoles.some(authorizedRole => roles.some(role => authorizedRole === role))) {
            throw ErrorFactory.UnAuthorizedRoleError(roles.join(' '))
        };
        await next();
    })
}