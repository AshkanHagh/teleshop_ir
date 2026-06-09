import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schemas/index.js";
import { Pool } from "pg";

export type Database = NodePgDatabase<typeof schema> & {
  $client?: Pool;
};
