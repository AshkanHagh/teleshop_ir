import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { orderedServiceTable } from "./order.model";

export const subscriptionDuration = ["سه ماهه", "شش ماهه", "یک ساله"] as const;
export const starQuantity = ["50", "75", "100", "150", "250", "350", "500", "750", 
    "1000", "1500", "2500", "5000", "10000", "25000", "35000", "50000"
] as const;

export const subscriptionDurationEnum = pgEnum("duration", subscriptionDuration);
export const starQuantities = pgEnum("star", starQuantity);

export const premiumTable = pgTable("premiums", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    duration: subscriptionDurationEnum().notNull(),
    features: table.jsonb().$type<string[]>().default([]).notNull(),
    tonQuantity: table.integer().notNull(),
    irrPrice: table.integer().notNull(),
    icon: table.varchar({ length: 15 }).notNull(),
    createdAt: table.timestamp().$defaultFn(() => new Date()).notNull(),
    updatedAt: table.timestamp().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull()
}));

export type SelectPremium = InferSelectModel<typeof premiumTable>;
export type InsertPremium = InferInsertModel<typeof premiumTable>;

export const starTable = pgTable("stars", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    stars: starQuantities("stars").notNull(),
    tonQuantity: table.integer().notNull(),
    irrPrice: table.integer().notNull(),
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