import Redis from 'ioredis';
import { env } from '@env';

const redis = new Redis(env.REDIS_URL, {
    enableAutoPipelining : false,
    lazyConnect : true,
    noDelay : true,
});
// redis.monitor((_, monitor) => {
//     monitor?.on('monitor', (time, args, source, database) => console.log(new Date(+time * 1000), args));
// });

export default redis;