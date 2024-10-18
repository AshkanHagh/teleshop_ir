import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from '../../env';

await migrate(drizzle({connection : env.DATABASE_URL, casing : 'snake_case' }), { migrationsFolder : './src/database/migrations' });
process.exit(0);