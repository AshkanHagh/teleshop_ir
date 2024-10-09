import { z } from 'zod';

const EnvSchema = z.object({
    PORT : z.coerce.number().default(7319),
    NODE_ENV : z.enum(['production', 'development']).default('development'),
    LOCAL_DATABASE_URL : z.string(),
    LOCAL_UPSTASH_REDIS_REST_URL : z.string(),
    LOCAL_UPSTASH_REDIS_REST_TOKEN : z.string(),
    ACCESS_TOKEN : z.string(),
    REFRESH_TOKEN : z.string(),
    PAYMENT_TOKEN_SECRET_KEY : z.string(),
    ACCESS_TOKEN_EXPIRE : z.coerce.number().default(5),
    REFRESH_TOKEN_EXPIRE : z.coerce.number().default(1),
    SENTRY_KEY : z.string(),
    SENTRY_AUTH_TOKEN : z.string(),
    ORIGIN : z.string(),
    BOT_FATHER_SECRET : z.string(),
    TELEGRAM_API_ID : z.string(),
    TELEGRAM_API_HASH : z.string(),
    COINGECKO_API : z.string(),
    EXCHANGERATE_API : z.string(),
    LOCAL_ZARINPAL_MERCHANT_ID : z.string(),
    PROD_DATABASE_URL : z.string(),
    PROD_UPSTASH_REDIS_REST_URL : z.string(),
    PROD_UPSTASH_REDIS_REST_TOKEN : z.string(),
    PAYMENT_REDIRECT_BASE_URL : z.string(),
    PROD_ZARINPAL_MERCHANT_ID : z.string(),
});

export type Env = z.infer<typeof EnvSchema>;
export const env : Env = EnvSchema.parse(process.env);