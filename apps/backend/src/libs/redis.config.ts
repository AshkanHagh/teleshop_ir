import { Redis } from '@upstash/redis';
import { env } from '../../env';

const { PROD_UPSTASH_REDIS_REST_URL, LOCAL_UPSTASH_REDIS_REST_URL, NODE_ENV, PROD_UPSTASH_REDIS_REST_TOKEN, 
    LOCAL_UPSTASH_REDIS_REST_TOKEN 
} = env;

const redis = new Redis({
    url : NODE_ENV === 'production' ? PROD_UPSTASH_REDIS_REST_URL : LOCAL_UPSTASH_REDIS_REST_URL,
    token : NODE_ENV === 'production' ? PROD_UPSTASH_REDIS_REST_TOKEN : LOCAL_UPSTASH_REDIS_REST_TOKEN,
    enableAutoPipelining : false,
    latencyLogging : true,
    automaticDeserialization : true,
});

export default redis;