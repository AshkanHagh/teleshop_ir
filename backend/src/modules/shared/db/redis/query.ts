import redis from "@shared/libs/redis";

export default class RedisQuery {
  // private conn: (ChainableCommander | Redis);

  // constructor(queryWithPipeline: boolean) {
  //     this.conn = queryWithPipeline ? redis.pipeline(): redis;
  // }

  public static async jsonGet(key: string, path: string) {
    return await redis.call("JSON.GET", key, path);
  }

  public static async jsonSet(
    key: string,
    path: string,
    value: string,
    ttl: number = 1000 * 60 * 60,
  ) {
    await redis.call("JSON.SET", key, path, value);
    await this.expire(key, ttl);
  }

  public static async stringSet(key: string, value: string, ttl: number) {
    await redis.set(key, value, "EX", ttl);
  }

  public static async expire(key: string, ttl: number) {
    await redis.expire(key, ttl);
  }

  public static async jsonDel(key: string, path: string) {
    await redis.call("JSON.DEL", key, path);
  }
}
