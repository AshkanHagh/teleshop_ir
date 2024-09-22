import { check, index, integer, jsonb, pgEnum, pgTable, smallint, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userTable } from './schema';
import { relations, sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

export const subscriptionDuration = ['سه ماهه', 'شش ماهه', 'یک ساله'] as const;
export type PremiumDuration = typeof subscriptionDuration[number];
export const starQuantity = ['50', '75', '100', '150', '250', '350', '500', '750', '1000', '1500', '2500', '5000', 
    '10000', '25000', '35000', '50000'
] as const;
export type StarQuantity = typeof starQuantity[number];

export const subscriptionDurationEnum = pgEnum('duration', subscriptionDuration);
export const starQuantities = pgEnum('star', starQuantity);
export const orderStatus = pgEnum('order_status', ['pending', 'in_progress', 'completed']);

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

export const orderTable = pgTable('orders', {
    id : uuid('id').primaryKey().defaultRandom(),
    status : orderStatus('status').default('pending').notNull(),
    userId : uuid('user_id').references(() => userTable.id).notNull(),
    premiumId : uuid('premium_id').references(() => premiumTable.id),
    starId : uuid('star_id').references(() => starTable.id),
    orderPlaced : timestamp('order_placed').defaultNow()
}, table => ({
    premiumOrStarCheck : check('premium_or_star_check',
        sql`COALESCE((${table.premiumId})::TEXT, '') <> '' OR COALESCE((${table.starId})::TEXT, '') <> ''`
    )
}));

export const drizzleOrderInsertSchema = createInsertSchema(orderTable);
export const drizzleOrderSelectSchema = createSelectSchema(orderTable);

export const premiumTableRelations = relations(premiumTable, ({ many }) => ({
    orders : many(orderTable)
}));

export const starTableRelations = relations(starTable, ({ many }) => ({
    orders : many(orderTable)
}));

export const orderTableRelations = relations(orderTable, ({ one }) => ({
    premium : one(premiumTable, {
        fields : [orderTable.premiumId],
        references : [premiumTable.id]
    }),
    star : one(starTable, {
        fields : [orderTable.starId],
        references : [starTable.id]
    }),
    user : one(userTable, {
        fields : [orderTable.userId],
        references : [userTable.id]
    })
}));