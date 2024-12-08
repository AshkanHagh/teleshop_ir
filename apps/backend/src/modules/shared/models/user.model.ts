import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";
import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { orderedServiceTable } from "./order.model";

export type InitRoles = ["admin" | "customer"];

export const userTable = pgTable("users", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    telegramId: table.bigint({mode: "number"}).notNull(),
    fullname: table.varchar({length: 140}).notNull(),
    username: table.varchar({length: 70}).notNull(),
    roles: table.jsonb().$type<InitRoles>().default(["customer"]).notNull(),
    createdAt: table.timestamp().$defaultFn(() => new Date()).notNull(),
    updatedAt: table.timestamp().$defaultFn(() => new Date()).$onUpdateFn(() => new Date).notNull(),
}), table => ({
    idxTelegramId: uniqueIndex("telegram_id_idx").on(table.telegramId)
}))

export const userTableRelations = relations(userTable, ({ many }) => ({
    order: many(orderedServiceTable)
}));

export type SelectUser = InferSelectModel<typeof userTable>;
export type InsertUser = InferInsertModel<typeof userTable>;