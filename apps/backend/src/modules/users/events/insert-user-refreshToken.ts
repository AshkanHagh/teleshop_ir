import { EventEmitter } from 'node:events';
import crypto from 'crypto';
import type { SelectUserTable } from '@types';
import { refreshTokenKeyById, usersKeyById } from '@shared/utils/keys';
import type { ChainableCommander } from 'ioredis';
import { env } from '@env';
import type ErrorHandler from '@shared/utils/errorHandler';
import { logger } from '@shared/libs/winston';
import Redis from '@shared/db/caching';

const cookieEvent = new EventEmitter();

const userCacheMaxAge : number = 1000 * 60 * 60 * env.ACCESS_TOKEN_EXPIRE;
const refreshTokenCacheMaxAge : number = 1000 * 60 * 60 * env.ACCESS_TOKEN_EXPIRE;
cookieEvent.on('handle_cache_cookie', async (user : SelectUserTable, refreshToken : string) => {
    try {
        console.log('herer');
        const userCache = await Redis.hgetall(usersKeyById(user.id)) as SelectUserTable | null;
        const oldUserDetailHash : string = convertToHash(stableStringify(userCache ? userCache : {}));
        const newUserDetailHash : string = convertToHash(stableStringify(user));

        const pipeline : ChainableCommander = Redis.pipeline();
        if(!userCache || !Object.keys(userCache).length || newUserDetailHash !== oldUserDetailHash) {
            Redis.hset(usersKeyById(user.id), user, userCacheMaxAge, pipeline);
            Redis.set(refreshTokenKeyById(user.id), refreshToken, refreshTokenCacheMaxAge, pipeline);
        };
    
        Redis.setExpire([refreshTokenKeyById(user.id), usersKeyById(user.id)], [refreshTokenCacheMaxAge, userCacheMaxAge], 
            pipeline
        );
        await pipeline.exec();
        
    } catch (error) {
        logger.log('warn', `Error inserting user and refreshToken to redis : ${(error as ErrorHandler).message}`);
    }
});

export const convertToHash = (value : string) : string => crypto.createHash('sha256').update(value).digest('hex');
const stableStringify = <T extends Record<string, unknown>>(obj : T) : string => {
    return JSON.stringify(Object.keys(obj).sort().reduce((result, key) => {
        result[key as keyof T] = obj[key as keyof T];
        return result;
    }, {} as T));
};

export default cookieEvent;