import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { orderedServiceTable } from "./order.model";

export const servicesTable = pgTable("services", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    title: table.text().notNull(),
    description: table.text().notNull(),
    route: table.text().notNull()
}));

export type SelectServices = InferSelectModel<typeof servicesTable>;
export type InsertServices = InferInsertModel<typeof servicesTable>;

export const premiumTable = pgTable("premiums", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    duration: table.varchar({length: 255}).notNull(),
    features: table.jsonb().$type<string[]>().default([]).notNull(),
    ton: table.integer().notNull(),
    irr: table.integer().notNull(),
    icon: table.varchar({ length: 15 }).notNull(),
    createdAt: table.timestamp().$defaultFn(() => new Date()).notNull(),
    updatedAt: table.timestamp().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull()
}));

export type SelectPremium = InferSelectModel<typeof premiumTable>;
export type InsertPremium = InferInsertModel<typeof premiumTable>;

export const starTable = pgTable("stars", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    stars: integer().notNull(),
    ton: table.integer().notNull(),
    irr: table.integer().notNull(),
    createdAt: table.timestamp().$defaultFn(() => new Date()).notNull(),
    updatedAt: table.timestamp().$defaultFn(() => new Date()).$onUpdateFn(() => new Date).notNull()
}));

export type InsertStar = InferInsertModel<typeof starTable>;
export type SelectStar = InferSelectModel<typeof starTable>;

export const premiumTableRelations = relations(premiumTable, ({ many }) => ({
    orders: many(orderedServiceTable)
}));

export const starTableRelations = relations(starTable, ({ many }) => ({
    orders: many(orderedServiceTable)
}));