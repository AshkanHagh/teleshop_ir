import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../utils.js";
import { relations } from "drizzle-orm";
import { TransactionTable } from "./transaction.model.js";

export const PremiumPlanTable = pgTable("premium_plans", (table) => ({
  id,
  duration: table.varchar({ length: 255 }).notNull(),
  features: table.jsonb().$type<string[]>().default([]).notNull(),
  ton: table.bigint({ mode: "number" }).notNull(),
  irr: table.bigint({ mode: "number" }).notNull(),
  icon: table.varchar({ length: 15 }).notNull(),
  createdAt,
  updatedAt,
}));

export type PremiumPlanForm = typeof PremiumPlanTable.$inferInsert;

export const premiumPlansRelations = relations(
  PremiumPlanTable,
  ({ many }) => ({
    transactions: many(TransactionTable),
  }),
);
