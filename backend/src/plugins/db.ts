import fp from "fastify-plugin";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../database/schemas/index.js";
import { Database } from "src/database/types.js";
import { FastifyPlugin } from "src/lib/fastify/constants.js";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}

export default fp(
  async (fastify) => {
    const pool = new Pool({
      connectionString: fastify.config.DATABASE_URL,
      max: 20,
      ssl: process.env.NODE_ENV === "production",
    });
    const db = drizzle(pool, {
      schema,
      casing: "snake_case",
    });

    fastify.decorate("db", db);
    fastify.addHook("onClose", async () => {
      await pool.end();
    });
  },
  { dependencies: [FastifyPlugin.Env] },
);
