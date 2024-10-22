import type { Context } from 'hono';
import * as jwt from 'hono/jwt';
import { cookieOptions, type CookieOptions } from '../schemas/zod.schema';
import { validationZodSchema } from './validation';
import cookieEvent from '../events/cookie.event';
import { setCookie } from 'hono/cookie';
import type { SelectUser } from '../types';
import ErrorHandler from './errorHandler';
import type { StatusCode } from 'hono/utils/http-status';
import { env } from '../../env';

const accessTokenExpires : number = env.ACCESS_TOKEN_EXPIRE
const refreshTokenExpires : number = env.REFRESH_TOKEN_EXPIRE

const cookieSanitizer = (maxAgeInSecond : number, options? : Partial<CookieOptions>,) : CookieOptions => {
    const option = <CookieOptions>{
        expires : new Date(Date.now() + maxAgeInSecond),
        maxAge : maxAgeInSecond,
        sameSite : options?.sameSite || 'lax',
        httpOnly : options?.httpOnly || true,
        secure : env.NODE_ENV === 'production'
    }
    return validationZodSchema(cookieOptions, option) as CookieOptions;
}

export const sendToken = async (context : Context, userDetail : Partial<SelectUser>) : Promise<string> => {
    const accessToken : string = await jwt.sign({...userDetail, exp : Math.floor(Date.now() / 1000) * 60 * 60 * accessTokenExpires},
        env.ACCESS_TOKEN
    );
    const refreshToken : string = await jwt.sign({...userDetail, 
        exp : Math.floor(Date.now() / 1000) * 60 * 60 * 24 * refreshTokenExpires
    }, env.REFRESH_TOKEN);
    cookieEvent.emit('handle_cache_cookie', userDetail, refreshToken);

    setCookie(context, 'access_token', accessToken, cookieSanitizer(60 * 60 * accessTokenExpires));
    setCookie(context, 'refresh_token', refreshToken, cookieSanitizer(60 * 60 * 24 * refreshTokenExpires));
    return accessToken;
}

type JwtError = {name : 'JwtTokenInvalid' | 'JwtTokenNotBefore' | 'JwtTokenExpired' | 'JwtTokenSignatureMismatched';}

export const decodeToken = async (token : string, secret : string) : Promise<unknown> => {
    try {
        const jwtToken = await jwt.verify(token, secret);
        return jwtToken;

    } catch (error : unknown) {
        const jwtErrorMap : Record<JwtError['name'], {message : string, statusCode : number}> = {
            'JwtTokenInvalid' : { message : 'Invalid Token.', statusCode : 401 },
            'JwtTokenNotBefore' : { message : 'Access Token has been used before its valid date.', statusCode : 401 },
            'JwtTokenExpired' : { message : 'Access Token has expired.', statusCode : 401 },
            'JwtTokenSignatureMismatched' : { message : 'Signature mismatch in the access token.', statusCode : 401 },
        }
        const mappedError = jwtErrorMap[(error as JwtError).name];
        throw new ErrorHandler(mappedError.message, mappedError.statusCode as StatusCode, 'An error occurred');
    }
}