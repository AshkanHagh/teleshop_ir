declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly PORT : number;
      readonly NODE_ENV : string;
      readonly POSTGRES_USER : string;
      readonly POSTGRES_PASSWORD : string;
      readonly POSTGRES_DB : string;
      readonly DATABASE_URL : string;
      readonly UPSTASH_REDIS_REST_TOKEN : string;
      readonly UPSTASH_REDIS_REST_URL : string;
      readonly SENTRY_KEY : string;
      readonly SENTRY_AUTH_TOKEN : string;
      readonly ORIGIN : string;
      readonly BOT_FATHER_SECRET : string;
      readonly ACCESS_TOKEN : string;
      readonly REFRESH_TOKEN : string;
      readonly ACCESS_TOKEN_EXPIRE : string;
      readonly REFRESH_TOKEN_EXPIRE : string;
      readonly AMQP_URL : string;
      readonly JWT_HANDLING_ROUTER_KEY : string;
      readonly COINGECKO_API : string;
      readonly EXCHANGERATE_API : string;
      readonly PAYMENT_REDIRECT_BASE_URL : string;
      readonly ZARINPAL_MERCHANT_ID : string;
      readonly PAYMENT_TOKEN_SECRET_KEY : string;
    }
  }
}

export {}
