import { decimal, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../utils.js";
import { relations } from "drizzle-orm";
import { TransactionTable } from "./transaction.schema.js";

export const StarPackageTable = pgTable("star_packages", (table) => ({
  id,
  stars: table.integer().notNull(),
  ton: table.bigint({ mode: "number" }).notNull(),
  irr: decimal({ mode: "number", precision: 12, scale: 0 }).notNull(),
  createdAt,
  updatedAt,
}));

export type StarPackage = typeof StarPackageTable.$inferSelect;
export type StarPackageForm = typeof StarPackageTable.$inferInsert;

export const starPackagesRelations = relations(
  StarPackageTable,
  ({ many }) => ({
    transactions: many(TransactionTable),
  }),
);
