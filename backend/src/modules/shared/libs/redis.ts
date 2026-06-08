import Redis from "ioredis";
import { env } from "@env";

const redis = new Redis(env.REDIS_URL, {
  enableAutoPipelining: true,
  lazyConnect: true,
  noDelay: true,
});

export default redis;
