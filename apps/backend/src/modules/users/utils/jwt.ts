import type { Context } from 'hono';
import * as jwt from 'hono/jwt';
import { cookieOptions, type CookieOptions } from '@shared/schemas';
import { validationZodSchema } from '@shared/utils/validation';
import { setCookie } from 'hono/cookie';
import { env } from '@env';
import type { SelectUserTable } from '@shared/types';
import cookieEvent from '../events/insert-user-refreshToken';

const accessTokenExpires : number = env.ACCESS_TOKEN_EXPIRE;
const refreshTokenExpires : number = env.REFRESH_TOKEN_EXPIRE;
const configCookieOptions = (maxAgeInSeconds : number, options? : Partial<CookieOptions>,) : CookieOptions => {
    const option = <CookieOptions>{
        expires : new Date(Date.now() + maxAgeInSeconds * 1000),
        maxAge : maxAgeInSeconds * 1000,
        sameSite : options?.sameSite || 'lax',
        httpOnly : options?.httpOnly || true,
        secure : env.NODE_ENV === 'production'
    }
    return validationZodSchema(cookieOptions, option) as CookieOptions;
}

export const sendToken = async (context : Context, userDetail : Partial<SelectUserTable>) : Promise<string> => {
    const defaultTime : number = Math.floor(Date.now() / 1000);
    const [refreshToken, accessToken] : [string, string] = await Promise.all([
        jwt.sign({userId : userDetail.id, roles: userDetail.roles, exp : defaultTime + refreshTokenExpires * 60 * 60}, env.REFRESH_TOKEN),
        jwt.sign({userId : userDetail.id, roles: userDetail.roles, exp : defaultTime + accessTokenExpires * 60}, env.ACCESS_TOKEN)
    ]);
    console.log(refreshToken);

    setCookie(context, 'access_token', accessToken, configCookieOptions(60 * accessTokenExpires));
    setCookie(context, 'refresh_token', refreshToken, configCookieOptions(60 * 60 * refreshTokenExpires));
    cookieEvent.emit('handle_cache_cookie', userDetail, refreshToken);

    return accessToken;
}
