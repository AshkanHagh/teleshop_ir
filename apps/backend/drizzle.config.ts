import { defineConfig } from 'drizzle-kit';
import { env } from './env';

export default defineConfig({
    schema : './src/modules/shared/db/schemas',
    out : './src/modules/shared/db/migrations',
    dialect : 'postgresql',
    dbCredentials : {
        url : env.DATABASE_URL
    },
    verbose : true,
    strict : true,
    casing : 'snake_case'
});