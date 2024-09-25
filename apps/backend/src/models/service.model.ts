import { index, integer, jsonb, pgEnum, pgTable, smallint, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations, sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { orderTable } from './schema';

export const subscriptionDuration = ['سه ماهه', 'شش ماهه', 'یک ساله'] as const;
export const starQuantity = ['50', '75', '100', '150', '250', '350', '500', '750', '1000', '1500', '2500', '5000', 
    '10000', '25000', '35000', '50000'
] as const;
export type StarQuantity = typeof starQuantity[number];

export const subscriptionDurationEnum = pgEnum('duration', subscriptionDuration);
export const starQuantities = pgEnum('star', starQuantity);

export const premiumTable = pgTable('premiums', {
    id : uuid('id').primaryKey().defaultRandom(),
    duration : subscriptionDurationEnum('duration').notNull(),
    features : jsonb('features').$type<string[]>().default([]),
    ton_quantity : smallint('ton').notNull(),
    irr_price : integer('irr').notNull(),
    icon : varchar('icon', { length : 15 }).notNull(),
    created_at : timestamp('created_at').defaultNow().notNull(),
    updated_at : timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`).notNull()
}, table => ({
    durationTonPriceIdx : index('duration_ton_price_idx').on(table.duration, table.ton_quantity),
    rialPriceIdx : index('premium_rial_price_idx').on(table.irr_price)
}));

export const drizzleInsertPremiumSchema = createInsertSchema(premiumTable);
export const drizzleSelectPremiumSchema = createSelectSchema(premiumTable);

export type DrizzleSelectPremium = InferSelectModel<typeof premiumTable>;
export type DrizzleInsertPremium = InferInsertModel<typeof premiumTable>;

export const starTable = pgTable('stars', {
    id : uuid('id').primaryKey().defaultRandom(),
    stars : starQuantities('stars').notNull(),
    ton_quantity : smallint('ton').notNull(),
    irr_price : integer('irr').notNull(),
    created_at : timestamp('created_at').defaultNow().notNull(),
    updated_at : timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`).notNull()
}, table => ({
    starsTonPriceIdx: index('stars_ton_price_idx').on(table.stars, table.ton_quantity),
    rialPriceIdx: index('star_rial_price_idx').on(table.irr_price)
}));

export const drizzleInsertStarSchema = createInsertSchema(starTable);
export const drizzleSelectStarSchema = createSelectSchema(starTable);

export type DrizzleInsertStar = InferInsertModel<typeof starTable>;
export type DrizzleSelectStar = InferSelectModel<typeof starTable>;

export const premiumTableRelations = relations(premiumTable, ({ many }) => ({
    orders : many(orderTable)
}));

export const starTableRelations = relations(starTable, ({ many }) => ({
    orders : many(orderTable)
}));