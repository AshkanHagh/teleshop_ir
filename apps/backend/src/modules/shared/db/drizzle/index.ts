import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../../models/schema";
import { env } from "@env";

export const db = drizzle({
    connection: env.DATABASE_URL, 
    schema, casing: "snake_case", 
});