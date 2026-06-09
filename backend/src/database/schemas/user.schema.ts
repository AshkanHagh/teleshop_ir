import { pgTable } from "drizzle-orm/pg-core";
import { id, createdAt, updatedAt } from "../utils.js";
import { relations } from "drizzle-orm";
import { TransactionTable } from "./transaction.model.js";

export type UserRole = "admin" | "customer";

export const UserTable = pgTable("users", (table) => ({
  id,
  telegramId: table.bigint({ mode: "number" }).unique().notNull(),
  fullname: table.varchar({ length: 255 }).notNull(),
  username: table.varchar({ length: 255 }).notNull(),
  roles: table.jsonb().$type<UserRole[]>().default(["customer"]).notNull(),
  createdAt,
  updatedAt,
}));

export type User = typeof UserTable.$inferSelect;

export const UserRelations = relations(UserTable, ({ many }) => ({
  transactions: many(TransactionTable),
}));
