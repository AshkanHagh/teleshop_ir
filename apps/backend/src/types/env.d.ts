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
    }
  }
}

export {}
