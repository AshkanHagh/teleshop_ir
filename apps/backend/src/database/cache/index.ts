import type { Redis } from '@upstash/redis';
import redis from '../../libs/redis.config';

type ValidRedisMethods = keyof Redis;
type MethodParams<T extends ValidRedisMethods> = Redis[T] extends (...args : infer P) => unknown ? P : never;
type MethodReturn<T extends ValidRedisMethods> = Redis[T] extends (...args : infer P) => infer R ? R : never;

export const executeRedisCommand = async <T extends ValidRedisMethods>(method : T,...params : MethodParams<T>) 
: Promise<MethodReturn<T>> => {
    return (redis[method] as (...args: MethodParams<T>) => MethodReturn<T>)(...params);
};

// 1. after completing the backend rewrite all redis queries in project in this file