import { insertUser } from "../repository/query";
import ErrorHandler from "@shared/utils/errorHandler";
import crypto from "crypto";
import { verifyJwtToken } from "@shared/utils/jwt";
import RedisKeys from "@shared/utils/keys";
import ErrorFactory from "@shared/utils/customErrors";
import { env } from "@env";
import type { SelectUser } from "@shared/models/schema";
import type { TelegramUser } from "../repository/types";
import RedisQuery from "@shared/db/redis/query";
import type { TokenPayload } from "@shared/types";

export const validateTelegramAuthService = async (authData: string): Promise<SelectUser> => {
    try {
        const telegramHashSecretKey: Buffer = crypto
            .createHmac("sha256", "WebAppData")
            .update(env.BOT_FATHER_SECRET)
            .digest();

        const telegramAuthData: URLSearchParams = new URLSearchParams(decodeURIComponent(authData));
        const userAuthDetailHash: string | null = telegramAuthData.get("hash");

        if (!userAuthDetailHash) {
            throw ErrorFactory.ValidationError("Missing hash, data is not trustworthy!");
        }
        telegramAuthData.delete("hash");

        const sortTelegramAuthKeys: string = Array.from(
            telegramAuthData
                .entries())
                .sort(([a], [b]) => a.localeCompare(b)
        )
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

        const computedUserAuthHash: string = crypto
            .createHmac("sha256", Uint8Array.from(telegramHashSecretKey))
            .update(sortTelegramAuthKeys)
            .digest("hex");
            
        if (computedUserAuthHash !== userAuthDetailHash) {
            throw ErrorFactory.ValidationError("Invalid hash, data is not trustworthy!");
        }
        
        const { user } = Object.fromEntries(telegramAuthData.entries());
        if (!user) throw ErrorFactory.ValidationError("Missing user, data is not trustworthy!");

        const { last_name, first_name, id, username } = JSON.parse(user) as TelegramUser;

        return await insertUser({
            fullname: `${first_name} ${last_name}`,
            telegramId: id, 
            username,
        });
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        console.log(error);
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
};

export const refreshTokenService = async (refreshToken: string): Promise<SelectUser> => {
    try {
        const tokenDetail = await verifyJwtToken(refreshToken, env.REFRESH_TOKEN) as TokenPayload;
        const isUserCashed = JSON.parse(
            await RedisQuery.jsonGet(RedisKeys.user(tokenDetail.id), ".") as string
        ) as SelectUser | null;

        if(!isUserCashed) throw ErrorFactory.AuthRequiredError("Authentication required: user account not found.");

        return isUserCashed;
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
};

export const updateUserCache = async (userDetail: SelectUser, refreshToken: string) => {
    try {
        const userCacheTTl: number = 1000 * 60 * 60 * env.ACCESS_TOKEN_EXPIRE;
        const refreshTokenCacheTTl: number = 1000 * 60 * 60 * env.ACCESS_TOKEN_EXPIRE;

        await Promise.all([
            RedisQuery.jsonSet(RedisKeys.user(userDetail.id), ".", JSON.stringify(userDetail), userCacheTTl),
            RedisQuery.stringSet(RedisKeys.refreshToken(userDetail.id), refreshToken, refreshTokenCacheTTl),
        ])
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
}