import { Ratelimit, type Duration } from '@upstash/ratelimit';
import redis from '../libs/redis.config';

const cache : Map<string, number> = new Map();

class RateLimiter {
    static instance : Ratelimit;
    static getInstance(limit : number, timeout : Duration) {
        if(!this.instance) {
            const ratelimit = new Ratelimit({
                redis : redis,
                analytics : true,
                limiter : Ratelimit.slidingWindow(limit, timeout),
                ephemeralCache : cache
            });
            this.instance = ratelimit;
            return this.instance;
            
        } else {
            return this.instance;
        }
    }
}

export default RateLimiter;