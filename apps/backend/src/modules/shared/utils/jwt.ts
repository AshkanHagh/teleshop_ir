import { verify } from 'hono/jwt';
import type { StatusCode } from 'hono/utils/http-status';
import ErrorHandler from './errorHandler';

type JwtError = {name : 'JwtTokenInvalid' | 'JwtTokenNotBefore' | 'JwtTokenExpired' | 'JwtTokenSignatureMismatched';}

export const decodeToken = async (token : string, secret : string) : Promise<unknown> => {
    try {
        const test = await verify(token, secret);
        console.log(test);
        return await verify(token, secret);
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