import { rateLimiter } from 'hono-rate-limiter';
import type { Context } from 'hono';

export default (windowMs : number, limit : number) => {
    return rateLimiter({
        windowMs, limit, standardHeaders : 'draft-6', keyGenerator: (_ : Context) => crypto.randomUUID()
    })
}