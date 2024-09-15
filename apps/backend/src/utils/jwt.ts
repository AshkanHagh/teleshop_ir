import type { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { cookieOptionsSchema, type CookieOptionsSchema } from '../schemas/zod.schema';
import { validationZodSchema } from './validation';
import type { SelectUser } from '../models/user.model';
import cookieEvent from '../events/cookie.event';
import { setCookie } from 'hono/cookie';

const accessTokenExpires = parseInt(process.env.ACCESS_TOKEN_EXPIRE);
const refreshTokenExpires = parseInt(process.env.REFRESH_TOKEN_EXPIRE)

const accessTokenCookieOptions = () : CookieOptionsSchema => {
    const maxAgeInSecond : number = accessTokenExpires * 60 * 60;
    const cookieOptions = <CookieOptionsSchema>{
        expires : new Date(Date.now() + maxAgeInSecond),
        maxAge : maxAgeInSecond,
        sameSite : 'lax',
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production'
    }
    return validationZodSchema(cookieOptionsSchema, cookieOptions) as CookieOptionsSchema;
}

const refreshTokenCookieOptions = () : CookieOptionsSchema => {
    const maxAgeInSecond : number = refreshTokenExpires * 24 * 60 * 60;
    const cookieOptions = <CookieOptionsSchema>{
        expires : new Date(Date.now() + maxAgeInSecond),
        maxAge : maxAgeInSecond,
        sameSite : 'lax',
        httpOnly : true,
        secure : process.env.NODE_ENV === 'production'
    }
    return validationZodSchema(cookieOptionsSchema, cookieOptions) as CookieOptionsSchema;
}

export const sendToken = (context : Context, userDetail : Partial<SelectUser>) : string => {
    const accessToken : string = jwt.sign(userDetail, process.env.ACCESS_TOKEN, {expiresIn : `${accessTokenExpires}m`});
    const refreshToken : string = jwt.sign(userDetail, process.env.REFRESH_TOKEN, {expiresIn : `${refreshTokenExpires}d`});
    cookieEvent.emit('handle_cache_cookie', userDetail, refreshToken);

    setCookie(context, 'access_token', accessToken, accessTokenCookieOptions());
    setCookie(context, 'refresh_token', refreshToken, refreshTokenCookieOptions());
    return accessToken;
}

export const decodeToken = (token : string, secret : string) : unknown => {
    return jwt.verify(token, secret) as unknown;
}