import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../../env';

const { NODE_ENV, LOCAL_DATABASE_URL, PROD_DATABASE_URL } = env;
const migrationClient = postgres(NODE_ENV ===  'production' ? PROD_DATABASE_URL : LOCAL_DATABASE_URL, {max : 1});
const migration = async () => {
    await migrate(drizzle(migrationClient), { migrationsFolder : './src/database/migrations' });
    await migrationClient.end();
}
migration();