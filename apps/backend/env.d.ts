declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly PORT : number;
      readonly NODE_ENV : string;
      readonly POSTGRES_USER : string;
      readonly POSTGRES_PASSWORD : string;
      readonly POSTGRES_DB : string;
      readonly DATABASE_URL : string;
      readonly REDIS_URL : string;
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
    }
  }
}

export {}
