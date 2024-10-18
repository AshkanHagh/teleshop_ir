import { EventEmitter } from 'node:events';
import crypto from 'crypto';
import type { SelectUser } from '../types';
import redis from '../libs/redis.config';
import { refreshTokenKeyById, usersKeyById } from '../utils/keys';
import RedisMethod from '../database/cache';
import type { ChainableCommander } from 'ioredis';

const cookieEvent = new EventEmitter();
const cacheMaxAge : number = 2 * 24 * 60 * 60;

cookieEvent.on('handle_cache_cookie', async (user : SelectUser, refreshToken : string) => {
    const userCache = await RedisMethod.jsonget(usersKeyById(user.id), '$') as SelectUser[] | null;
    const pipeline : ChainableCommander = redis.pipeline();

    const insertCache = (pipeline : ChainableCommander) => RedisMethod.pipelineJsonset(pipeline, usersKeyById(user.id), '$', user, null);
    const setExpireAndToken = (pipeline : ChainableCommander) => {
        // @ts-expect-error redis type has a bug for set method
        RedisMethod.executeCommand(pipeline, 'set', refreshTokenKeyById(user.id), refreshToken)
        pipeline.expire(usersKeyById(user.id), cacheMaxAge).expire(refreshTokenKeyById(user.id), cacheMaxAge);
    }

    if(!userCache || !userCache.length) {
        await Promise.all([insertCache(pipeline), setExpireAndToken(pipeline)])
        return await pipeline.exec();
    };

    const userCacheHash : string = hashGenerator(stableStringify(userCache[0]));
    const userHash : string = hashGenerator(stableStringify(user));
    if(userHash !== userCacheHash) {
        await Promise.all([insertCache(pipeline), setExpireAndToken(pipeline)])
        return await pipeline.exec();
    }
    setExpireAndToken(pipeline)
    await pipeline.exec();
});

export const hashGenerator = (value : string) : string => {
    return crypto.createHash('sha256').update(value).digest('hex');
}

const stableStringify = <T extends Record<string, unknown>>(obj : T) : string => {
    return JSON.stringify(Object.keys(obj).sort().reduce((result, key) => {
        result[key as keyof T] = obj[key as keyof T];
        return result;
    }, {} as T));
};

export default cookieEvent;