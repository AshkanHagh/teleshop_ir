import { defineConfig } from 'drizzle-kit';
import { env } from './env';

const { NODE_ENV, LOCAL_DATABASE_URL, PROD_DATABASE_URL } = env;
export default defineConfig({
    schema : './src/models/schema.ts',
    out : './src/database/migrations',
    dialect : 'postgresql',
    dbCredentials : {
        url : NODE_ENV === 'production' ? PROD_DATABASE_URL : LOCAL_DATABASE_URL
    },
    verbose : true,
    strict : true,
});