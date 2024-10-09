import type { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { cookieOptions, type CookieOptions } from '../schemas/zod.schema';
import { validationZodSchema } from './validation';
import cookieEvent from '../events/cookie.event';
import { setCookie } from 'hono/cookie';
import type { SelectUser } from '../types';
import ErrorHandler from './errorHandler';
import type { StatusCode } from 'hono/utils/http-status';
import { env } from '../../env';

const accessTokenExpires = env.ACCESS_TOKEN_EXPIRE
const refreshTokenExpires = env.REFRESH_TOKEN_EXPIRE

const accessTokenCookieOptions = () : CookieOptions => {
    const maxAgeInSecond : number = accessTokenExpires * 60 * 60;
    const option = <CookieOptions>{
        expires : new Date(Date.now() + maxAgeInSecond),
        maxAge : maxAgeInSecond,
        sameSite : 'lax',
        httpOnly : true,
        secure : env.NODE_ENV === 'production'
    }
    return validationZodSchema(cookieOptions, option) as CookieOptions;
}

const refreshTokenCookieOptions = () : CookieOptions => {
    const maxAgeInSecond : number = refreshTokenExpires * 24 * 60 * 60;
    const option = <CookieOptions>{
        expires : new Date(Date.now() + maxAgeInSecond),
        maxAge : maxAgeInSecond,
        sameSite : 'lax',
        httpOnly : true,
        secure : env.NODE_ENV === 'production'
    }
    return validationZodSchema(cookieOptions, option) as CookieOptions;
}

export const sendToken = (context : Context, userDetail : Partial<SelectUser>) : string => {
    const accessToken : string = jwt.sign(userDetail, env.ACCESS_TOKEN, {expiresIn : `${accessTokenExpires}m`});
    const refreshToken : string = jwt.sign(userDetail, env.REFRESH_TOKEN, {expiresIn : `${refreshTokenExpires}d`});
    cookieEvent.emit('handle_cache_cookie', userDetail, refreshToken);

    setCookie(context, 'access_token', accessToken, accessTokenCookieOptions());
    setCookie(context, 'refresh_token', refreshToken, refreshTokenCookieOptions());
    return accessToken;
}

export const decodeToken = (token : string, secret : string) : unknown => {
    try {
        const tokenDetail = jwt.verify(token, secret);
        return tokenDetail;

    } catch (error : unknown) {
        const jwtErrorMap : Record<string, {message : string, statusCode : number}> = {
            'JsonWebTokenError' : { message : 'Invalid Token', statusCode : 401 },
            'TokenExpiredError' : { message : 'Access Token has expired', statusCode : 401 },
        }
        const errorType : string = (error as jwt.JsonWebTokenError).name;
        const mappedError = jwtErrorMap[errorType];
        throw new ErrorHandler(mappedError.message, mappedError.statusCode as StatusCode, 'An error occurred');
    }
}

export const generatePaymentJwt = (userId : string) : string => {
    return jwt.sign({ userId }, env.PAYMENT_TOKEN_SECRET_KEY, {expiresIn : '10m'});
}