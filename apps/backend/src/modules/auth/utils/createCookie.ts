import type { Context } from "hono";
import * as jwt from "hono/jwt";
import { type CookieOptions } from "@shared/schemas";
import { setCookie } from "hono/cookie";
import { env } from "@env";
import type { SelectUser } from "@shared/models/user.model";
import cookieEvent from "../events";

const accessTokenExpiresTime: number = env.ACCESS_TOKEN_EXPIRE;
const refreshTokenExpiresTime: number = env.REFRESH_TOKEN_EXPIRE;

const configureCookieOptions = (maxAgeInSeconds: number, options?: Partial<CookieOptions>): CookieOptions => {
    const cookieOptions = <CookieOptions>{
        expires: new Date(Date.now() + maxAgeInSeconds * 1000),
        maxAge: maxAgeInSeconds * 1000,
        sameSite: options?.sameSite || "lax",
        httpOnly: options?.httpOnly || true,
        secure: env.NODE_ENV === "production"
    }
    return cookieOptions;
}

export const createCookie = async (context: Context, userDetail: SelectUser): Promise<string> => {
    const now: number = Math.floor(Date.now() / 1000);

    const [refreshToken, accessToken]: [string, string] = await Promise.all([
        jwt.sign( // refresh token
            generateJwtSignValue(userDetail, now + refreshTokenExpiresTime * 60 * 60),
            env.REFRESH_TOKEN
        ),
        jwt.sign( // access token
            generateJwtSignValue(userDetail, now + accessTokenExpiresTime * 60),
            env.ACCESS_TOKEN
        )
    ]);

    setCookie(context, "access_token", accessToken, configureCookieOptions(60 * accessTokenExpiresTime));
    setCookie(context, "refresh_token", refreshToken, configureCookieOptions(60 * 60 * refreshTokenExpiresTime));
    cookieEvent.emit("insert_user_data", userDetail, refreshToken);

    return accessToken;
}

const generateJwtSignValue = (userDetail: Partial<SelectUser>, exp: number) => {
    return {
        id: userDetail.id, 
        roles: userDetail.roles, 
        exp
    }
}