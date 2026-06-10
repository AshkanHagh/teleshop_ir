import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../utils.js";
import { relations } from "drizzle-orm";
import { TransactionTable } from "./transaction.schema.js";

export const StarPackageTable = pgTable("star_packages", (table) => ({
  id,
  stars: table.integer().notNull(),
  ton: table.bigint({ mode: "number" }).notNull(),
  irr: table.bigint({ mode: "number" }).notNull(),
  createdAt,
  updatedAt,
}));

export type StarPackageForm = typeof StarPackageTable.$inferInsert;

export const starPackagesRelations = relations(
  StarPackageTable,
  ({ many }) => ({
    transactions: many(TransactionTable),
  }),
);
