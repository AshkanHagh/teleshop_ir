import { EventEmitter } from "node:events";
import crypto from "crypto";
import { refreshTokenKeyById, usersKeyById } from "@shared/utils/keys";
import { env } from "@env";
import type ErrorHandler from "@shared/utils/errorHandler";
import { logger } from "@shared/libs/winston";
import type { SelectUser } from "@shared/models/schema";
import RedisQuery from "@shared/db/redis/query";

const cookieEvent = new EventEmitter();

const userCacheTTl: number = 1000 * 60 * 60 * env.ACCESS_TOKEN_EXPIRE;
const refreshTokenCacheTTl: number = 1000 * 60 * 60 * env.ACCESS_TOKEN_EXPIRE;

cookieEvent.on("insert_user_data", async (userDetail: SelectUser, refreshToken: string) => {
    try {
        const isUserCashed = JSON.parse(
            await RedisQuery.jsonGet(usersKeyById(userDetail.id), ".") as string
        ) as SelectUser | null;

        const cachedUserDetailHash: string = generateHashFromUser(
            stringifyAndSortUserDataKeys(isUserCashed ? isUserCashed: {})
        );
        const currentUserDetailHash: string = generateHashFromUser(stringifyAndSortUserDataKeys(userDetail));

        let userCashKey: string = usersKeyById(userDetail.id);
        let refreshTokenCashKey: string = refreshTokenKeyById(userDetail.id);
        
        if(cachedUserDetailHash !== currentUserDetailHash) {
            logger.info(`user: ${userDetail.id} cash missed`);

            RedisQuery.jsonSet(userCashKey, ".", JSON.stringify(userDetail));
            RedisQuery.stringSet(refreshTokenCashKey, refreshToken, refreshTokenCacheTTl);
        };

        await Promise.all([
            RedisQuery.expire(userCashKey, userCacheTTl),
            RedisQuery.expire(refreshTokenCashKey, refreshTokenCacheTTl),
        ])
        
    } catch (error) {
        logger.warn(`Error inserting user and refreshToken to redis: ${(error as ErrorHandler).message}`);
    }
});

export const generateHashFromUser = (value: string): string => crypto.createHash("sha256").update(value).digest("hex");

const stringifyAndSortUserDataKeys = <T extends Record<string, unknown>>(obj: T): string => {
    return JSON.stringify(Object.keys(obj).sort().reduce((result, key) => {
        result[key as keyof T] = obj[key as keyof T];
        return result;
    }, {} as T));
};

export default cookieEvent;