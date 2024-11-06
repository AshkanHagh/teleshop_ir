import type { ChainableCommander } from 'ioredis';
import redis from '@shared/libs/redis';
import ErrorHandler from '@shared/utils/errorHandler';

type HashSetValueType<Value> = {
    [Key in string] : Value
}

export default class Redis {

    static pipeline() {
        return redis.pipeline();
    }

    static async hdel(key : string) : Promise<void> {
        try {
            await redis.hdel(key);

        } catch (error : unknown) {
            throw new Error(`An error occurred in deleting hash from redis : ${(error as ErrorHandler).message}`);
        }
    }

    static async hset<Value>(key : string, value : HashSetValueType<Value>, ttl : number, pipe? : ChainableCommander) : Promise<void> {
        try {
            const pipeline : ChainableCommander = pipe ? pipe : redis.pipeline();
            pipeline.hset(key, value).expire(key, ttl, 'XX');
            if(!pipe) await pipeline.exec();
        } catch (error : unknown) {
            throw new Error(`An error occurred in setting hash to redis : ${(error as ErrorHandler).message}`);
        }
    }

    static async hgetall<T>(key : string, ttl? : number, pipe? : ChainableCommander) {
        try {
            const pipeline : ChainableCommander = pipe ? pipe : redis.pipeline();
            if(ttl) pipeline.expire(key, ttl, 'XX');
            pipeline.hgetall(key);
            if(!pipe) return (await pipeline.exec())!.map(data => data[1]) as T;
            
        } catch (error) {
            throw new Error(`An error occurred while getting hashed data in redis : ${(error as ErrorHandler).message}`);
        }
    }

    static async lrange(key : string) {
        try {
            return await redis.lrange(key, 0, -1);
            
        } catch (error) {
            throw new Error(`An error occurred while getting hashed data in redis : ${(error as ErrorHandler).message}`);
        }
    }

    static async set<Value>(key : string, value : Value, ttl : number, pipe? : ChainableCommander) : Promise<void> {
        try {
            const pipeline : ChainableCommander = pipe ? pipe : redis.pipeline();
            pipeline.set(key, JSON.stringify(value));
            if(ttl) pipeline.expire(key, ttl, 'XX');
            if(!pipe) await pipeline.exec();
            
        } catch (error) {
            throw new Error(`An error occurred while getting hashed data in redis : ${(error as ErrorHandler).message}`);
        }
    }

    static async setExpire(key : string | string[], ttl : number | number[], pipe? : ChainableCommander) {
        try {
            const pipeline : ChainableCommander = pipe ? pipe : redis.pipeline();
            if(Array.isArray(key) && Array.isArray(ttl)) {
                key.forEach((key, index) => pipeline.expire(key, ttl[index]))
            }else {
                pipeline.expire(key as string, ttl as number);
            };
            if(!pipe) await pipeline.exec();
            
        } catch (error) {
            throw new Error(`Error setting data for key ${key} : ${(error as ErrorHandler).message}`);
        }
    }
}