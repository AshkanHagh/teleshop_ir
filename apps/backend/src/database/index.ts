import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../models/schema';
import postgres from 'postgres';
import { env } from '../../env';

const { NODE_ENV, LOCAL_DATABASE_URL, PROD_DATABASE_URL } = env;
const client = postgres(NODE_ENV === 'production' ? PROD_DATABASE_URL : LOCAL_DATABASE_URL);
export const db = drizzle(client, { schema });