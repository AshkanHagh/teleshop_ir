import { checkUsrExistsOrInsertUser, findUserById } from "../repository/query";
import ErrorHandler from "@shared/utils/errorHandler";
import crypto from "crypto";
import { verifyJwtToken } from "@shared/utils/jwt";
import { usersKeyById } from "@shared/utils/keys";
import ErrorFactory from "@shared/utils/customErrors";
import { env } from "@env";
import type { InitRoles, SelectUser } from "@shared/models/schema";
import type { TelegramUser } from "../repository/domain";
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
        
        const { user, auth_date } = Object.fromEntries(telegramAuthData.entries());
        const { last_name, first_name, id, username } = JSON.parse(user) as TelegramUser;

        return await checkUsrExistsOrInsertUser({
            fullname: `${first_name} ${last_name}`,
            telegramId: id, 
            username,
            lastLogin: new Date()
        });
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
};

export const refreshTokenService = async (refreshToken: string): Promise<SelectUser> => {
    try {
        const tokenDetail = await verifyJwtToken(refreshToken, env.REFRESH_TOKEN) as TokenPayload;
        const isUserCashed = JSON.parse(
            await RedisQuery.jsonGet(usersKeyById(tokenDetail.id), ".") as string
        ) as SelectUser | null;

        const user: SelectUser | null = isUserCashed ? isUserCashed : await findUserById(tokenDetail.id);
        if(!user) throw ErrorFactory.AuthRequiredError("Authentication required: user account not found.");

        return user;
        
    } catch (err: unknown) {
        const error: ErrorHandler = err as ErrorHandler;
        throw new ErrorHandler(error.statusCode, error.kind, error.developMessage, error.clientMessage);
    }
};