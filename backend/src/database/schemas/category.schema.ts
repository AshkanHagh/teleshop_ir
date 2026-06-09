import { pgTable } from "drizzle-orm/pg-core";

export const CategoryTable = pgTable("categories", (table) => ({
  id: table.uuid().primaryKey().defaultRandom().notNull(),
  title: table.text().notNull(),
  description: table.text().notNull(),
  route: table.text().notNull(),
}));
