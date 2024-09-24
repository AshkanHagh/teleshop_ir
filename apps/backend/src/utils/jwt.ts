import type { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { cookieOptionsSchema, type CookieOptionsSchema } from '../schemas/zod.schema';
import { validationZodSchema } from './validation';
import cookieEvent from '../events/cookie.event';
import { setCookie } from 'hono/cookie';
import type { DrizzleSelectUser } from '../models/user.model';
import ErrorHandler from '../middlewares/errorHandler';
import type { StatusCode } from 'hono/utils/http-status';

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

export const sendToken = (context : Context, userDetail : Partial<DrizzleSelectUser>) : string => {
    const accessToken : string = jwt.sign(userDetail, process.env.ACCESS_TOKEN, {expiresIn : `${accessTokenExpires}m`});
    const refreshToken : string = jwt.sign(userDetail, process.env.REFRESH_TOKEN, {expiresIn : `${refreshTokenExpires}d`});
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

export const generateJwt = (data : unknown, expiresTime : string) : string => {
    return jwt.sign(data as string, process.env.PAYMENT_TOKEN_SECRET_KEY, {expiresIn : expiresTime})
}