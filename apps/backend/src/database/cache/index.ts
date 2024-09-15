import redis from '../../configs/redis.config';

export const hset = async <T>(hashKey : string, hashValue : T, expiresTime? : number) : Promise<void> => {
    if(expiresTime) {
        await Promise.all([redis.hset(hashKey, hashValue as string), redis.expire(hashKey, expiresTime)])
    } else {
        await redis.hset(hashKey, hashValue as string);
    }
}

export const hgetall = async <T>(hashKey : string, expiresTime? : number) : Promise<T> => {
    if(expiresTime) {
        const [cacheDetail] = await Promise.all([redis.hgetall(hashKey) as T, redis.expire(hashKey, expiresTime)]);
        return cacheDetail;
    } else {
        return await redis.hgetall(hashKey) as T;
    }
}

export const sset = async <T>(stringKey : string, stringValue : T, expiresTime? : number) : Promise<void> => {
    if(expiresTime) {
        await Promise.all([redis.set(stringKey, stringValue as string), redis.expire(stringKey, expiresTime)])
    } else {
        await redis.set(stringKey, stringValue as string);
    }
}

export const setKeyExpire = async (key : string, expireTime : number) => {
    await redis.expire(key, expireTime);
}