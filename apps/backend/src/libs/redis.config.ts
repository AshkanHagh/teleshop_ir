import { Redis } from '@upstash/redis';

const redis = new Redis({
    url : process.env.UPSTASH_REDIS_REST_URL,
    token : process.env.UPSTASH_REDIS_REST_TOKEN,
    enableAutoPipelining : true,
    latencyLogging : true,
    retry : {
        backoff(retryCount) {
            return retryCount + 15
        },
        retries : 15
    },
    automaticDeserialization : true,
});

export default redis;