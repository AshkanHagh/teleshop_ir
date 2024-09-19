import redis from '../../configs/redis.config';

export const hset = async <T>(hashKey : string, hashValue : T, expiresTime? : number) : Promise<void> => {
    const tasks = [redis.hset(hashKey, hashValue as string)];
    if(expiresTime) tasks.push(redis.expire(hashKey, expiresTime));
    await Promise.all(tasks);
}

export const hgetall = async <T>(hashKey : string, expiresTime? : number) : Promise<T> => {
    const tasks = [redis.hgetall(hashKey) as T];
    if(expiresTime) tasks.push(redis.expire(hashKey, expiresTime) as T);
    const [cache] = await Promise.all(tasks);
    return cache;
}

export const sset = async <T>(stringKey : string, stringValue : T, expiresTime : number) : Promise<void> => {
    await redis.set(stringKey, stringValue as string, 'EX', expiresTime);
}

export const smembers = async (setKey : string, expiresTime? : number) : Promise<string[]> => {
    const tasks = [redis.smembers(setKey) as unknown];
    if(expiresTime) tasks.push(redis.expire(setKey, expiresTime));
    const [cache] = await Promise.all(tasks);
    return cache as string[];
}

export const sadd = async (setKey : string, setValue : string, expiresTime : number) => {
    const tasks = [redis.sadd(setKey, setValue)];
    if(expiresTime) tasks.push(redis.expire(setKey, expiresTime));
    await Promise.all(tasks);
}

export const setKeyExpire = async (key : string, expireTime : number) => {
    await redis.expire(key, expireTime);
}

export const hget = async <T>(hashKey : string, hashIndex : string, expiresTime? : number) : Promise<T> => {
    const tasks = [redis.hget(hashKey, hashIndex) as T];
    if(expiresTime) tasks.push(redis.expire(hashKey, expiresTime) as T);
    const [cache] = await Promise.all(tasks);
    return cache;
}