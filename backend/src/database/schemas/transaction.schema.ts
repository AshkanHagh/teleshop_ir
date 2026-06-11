import { pgEnum, pgTable, decimal, index } from "drizzle-orm/pg-core";
import { UserTable } from "./user.schema.js";
import { PremiumPlanTable } from "./premium-plan.schema.js";
import { StarPackageTable } from "./star-package.schema.js";
import { id, createdAt, updatedAt } from "../utils.js";
import { relations } from "drizzle-orm";

export const TransactionStatus = pgEnum("transaction_status", [
  "checkout_pending",
  "pending",
  "progress",
  "completed",
  "failed",
]);
export const TransactionType = pgEnum("transaction_types", [
  "premium",
  "stars",
]);

export const TransactionTable = pgTable("transactions", (table) => ({
  id,
  userId: table
    .uuid()
    .references(() => UserTable.id, { onDelete: "set null" })
    .notNull(),
  type: TransactionType().notNull(),
  premiumPlanId: table
    .uuid()
    .references(() => PremiumPlanTable.id, { onDelete: "restrict" }),
  starPackageId: table
    .uuid()
    .references(() => StarPackageTable.id, { onDelete: "restrict" }),
  irr: decimal({ mode: "number", precision: 12, scale: 0 }).notNull(),
  status: TransactionStatus().default("checkout_pending").notNull(),
  transactionId: table.varchar({ length: 255 }).notNull(),
  createdAt,
  updatedAt,
}));

export type Transaction = typeof TransactionTable.$inferSelect;

export const TransactionRelations = relations(TransactionTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [TransactionTable.userId],
    references: [UserTable.id],
  }),
  premiumPlan: one(PremiumPlanTable, {
    fields: [TransactionTable.premiumPlanId],
    references: [PremiumPlanTable.id],
  }),
  starPackage: one(StarPackageTable, {
    fields: [TransactionTable.starPackageId],
    references: [StarPackageTable.id],
  }),
}));
