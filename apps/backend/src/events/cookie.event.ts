import { EventEmitter } from 'node:events';
import type { SelectUser } from '../models/schema';
import crypto from 'crypto';
import type { CachedUserDetail } from '../database/queries';
import { hgetall, hset, setKeyExpire, sset } from '../database/cache';
import { prefixUserCachedDetail } from '../services/auth.service';

const cookieEvent = new EventEmitter();

cookieEvent.on('handle_cache_cookie', async (user : SelectUser, refreshToken : string) => {
    const checkUserCache : CachedUserDetail = await hgetall(`user:${user.telegram_id}`);
    const cachedUserHash : string = hashGenerator(stableStringify(prefixUserCachedDetail(checkUserCache, 'cache')));
    const newUserHash : string = hashGenerator(stableStringify(user));

    const cacheMaxAge : number = 2 * 24 * 60 * 60;
    cachedUserHash || '' !== newUserHash 
    ? await Promise.all([hset(`user:${user.id}`, user, cacheMaxAge), hset(`user_telegram:${user.telegram_id}`, user, cacheMaxAge)])
    : await Promise.all([setKeyExpire(`user:${user.id}`, cacheMaxAge), setKeyExpire(`user:${user.telegram_id}`, cacheMaxAge)])
    await sset(`refresh_token:${user.id}`, refreshToken, cacheMaxAge);
});

export const hashGenerator = (value : string) : string => {
    return crypto.createHash('sha256').update(value).digest('hex');
}

const stableStringify = <T extends Record<string, unknown>>(obj : T) : string => {
    return JSON.stringify(Object.keys(obj).sort().reduce((result, key ) => {
        result[key as keyof T] = obj[key as keyof T];
        return result;
    }, {} as T));
};

export default cookieEvent;