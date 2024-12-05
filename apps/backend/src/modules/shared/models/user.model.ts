import { pgTable } from "drizzle-orm/pg-core";
import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { orderedServiceTable } from "./order.model";

export type InitRoles = ["admin" | "customer"];

export const userTable = pgTable("users", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    telegramId: table.integer().notNull(),
    fullname: table.varchar().notNull(),
    username: table.varchar().unique().notNull(),
    roles: table.jsonb().$type<InitRoles>().default(["customer"]).notNull(),
    lastLogin: table.timestamp().notNull(),
    createdAt: table.timestamp().$defaultFn(() => new Date()).notNull(),
    updatedAt: table.timestamp().$defaultFn(() => new Date()).$onUpdateFn(() => new Date).notNull(),
}))

export const userTableRelations = relations(userTable, ({ many }) => ({
    order: many(orderedServiceTable)
}));

export type SelectUser = InferSelectModel<typeof userTable>;
export type InsertUser = InferInsertModel<typeof userTable>;