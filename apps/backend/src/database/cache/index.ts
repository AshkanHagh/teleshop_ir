import type { ChainableCommander, Redis, RedisCommander } from 'ioredis';
import redis from '../../libs/redis.config';

type ValidRedisMethods = keyof RedisCommander;
type MethodParams<T extends ValidRedisMethods> = RedisCommander[T] extends (...args : infer P) => unknown ? P : never;
type MethodReturn<T extends ValidRedisMethods> = RedisCommander[T] extends (...args : infer _) => infer R ? R : never;
export type IndexSearch<T> = {data : T[], totalItem : number};

export default class RedisMethod {
    static executeCommand = async <T extends ValidRedisMethods>(client : (ChainableCommander | Redis), method : T,
    ...params : MethodParams<T>) : Promise<MethodReturn<T>> => {
        // @ts-expect-error ts bug
        return (client[method] as (...args: MethodParams<T>) => MethodReturn<T>)(...params);
    };
    
    static jsonset = async <T>(key : string, path : string, data : T, ttl : number | null = null) 
    : Promise<void> => {
        await Promise.all([redis.call('JSON.SET', key, path, JSON.stringify(data)), ttl ? redis.expire(key, ttl) : undefined]);
    }

    static pipelineJsonset = <T>(client : ChainableCommander, key : string, path : string, data : T, ttl : number | null = null) : void => {
        if(ttl) client.expire(key, ttl);
        client.call('JSON.SET', key, path, JSON.stringify(data))
    }

    static pipelineJsonArrappend = <T>(client : ChainableCommander, key : string, path : string, data : T, ttl : number | null = null) : void => {
        if(ttl) client.expire(key, ttl);
        client.call('JSON.ARRAPPEND', key, path, JSON.stringify(data))
    }
    
    static jsonget = async <T>(key : string, path : string) : Promise<T> => {
        return JSON.parse(await redis.call('JSON.GET', key, path) as string) as T;
    }

    static jsondel = async (key : string, path : string) : Promise<void> => {
        await redis.call('JSON.DEL', key, path);
    }

    static pipelineJsondel = async (client : ChainableCommander, key : string, path : string) : Promise<void> => {
        client.call('JSON.DEL', key, path);
    }

    static pipelineJsonget = async (client : ChainableCommander, key : string, path : string) : Promise<void> => {
        client.call('JSON.GET', key, path);
    }

    static redisIndex = async (indexName : string, prefix : string, fields : string[]) => {
        await redis.call('FT.CREATE', indexName, 'ON', 'JSON', 'PREFIX', '1', prefix, 'SCHEMA', ...fields);      
    }

    static indexSearch = async <T>(indexName : string, query : string, ...options : string[]) : Promise<IndexSearch<T> | null> => {
        const searchResult = await redis.call('FT.SEARCH', indexName, query, ...options) as string[];
        const parsedResult : T[] = searchResult.filter(item => 
            Array.isArray(item) && item.length > 1 && typeof item[1] === 'string' && item[1].startsWith('{')
        ).map(item => JSON.parse(item[1])).filter(item => item !== null);
        return parsedResult.length ? {data : parsedResult, totalItem : parseInt(searchResult[0])} : null;
    }
}