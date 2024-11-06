import type { Context, Next } from 'hono';
import ErrorHandler from '@shared/utils/errorHandler';
import type { InitRoles, SelectUserTable } from '@types';
import { validationZodSchema } from '@shared/utils/validation';
import { usersKeyById } from '@shared/utils/keys';
import { decodeToken } from '@shared/utils/jwt';
import { bearerToken } from '../schemas';
import { CatchAsyncError } from '@shared/utils/catchAsyncError';
import ErrorFactory from '@shared/utils/customErrors';
import { env } from '@env';
import Redis from '@shared/db/caching';

const changeUserRolesToArrayFromHashCache = (user : SelectUserTable) => {
    // @ts-expect-error hasdfh
    user.roles = [user.roles];
    return user;
}

export const isAuthenticated = async (context : Context, next : Next) : Promise<void> => {
    try {
        const bearer : string | undefined = context.req.header('authorization');
        const validatedBearerToken : string = validationZodSchema(bearerToken, bearer) as string;
        const accessToken : string = validatedBearerToken.split(' ')[1];

        const { userId } = await decodeToken(accessToken, env.ACCESS_TOKEN) as { userId : string, exp : number };
        if(!userId) throw ErrorFactory.AccessTokenInvalidError();

        const currentUserCache = await Redis.hgetall(usersKeyById(userId)) as SelectUserTable[] | null;
        if(!currentUserCache || !currentUserCache.length) throw ErrorFactory.InitRequiredError();
        const user = changeUserRolesToArrayFromHashCache(currentUserCache[0]);
        context.set('user', user);
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