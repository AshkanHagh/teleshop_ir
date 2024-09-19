import { check, index, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userTable } from './schema';
import { relations, sql, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

const subscriptionDurationPricing = {'سه ماهه' : '2.22', 'شش ماهه' : '2.96', 'یک ساله' : '5.37'} as const;
type SubscriptionDuration = keyof typeof subscriptionDurationPricing;
type SubscriptionPricing = typeof subscriptionDurationPricing[SubscriptionDuration];

const subscriptionDurationArray = Object.keys(subscriptionDurationPricing) as [SubscriptionDuration, ...SubscriptionDuration[]];
const subscriptionPricingArray = Object.values(subscriptionDurationPricing) as [SubscriptionPricing, ...SubscriptionPricing[]];

export const starQuantityPricing = {
    '50': '0.1328', '75': '0.1993', '100': '0.2657', '150': '0.3986', '250': '0.6643', '350': '0.9300', '500': '1.3286', '750': '1.9930',
    '1000': '2.6573', '1500': '3.9860', '2500': '6.6434', '5000': '13.2869', '10000': '26.5738', '25000': '66.4345',
    '35000': '93.0084', '50000': '132.8691'
} as const;
export type StarQuantity = keyof typeof starQuantityPricing;
export type StarPricing = typeof starQuantityPricing[StarQuantity];

const starQuantitiesArray = Object.keys(starQuantityPricing) as [StarQuantity, ...StarQuantity[]];
const starPricingArray = Object.values(starQuantityPricing) as [StarPricing, ...StarPricing[]];

export const subscriptionDuration = pgEnum('subscription_duration', subscriptionDurationArray);
export const subscriptionTonPrice = pgEnum('subscription_ton_price', subscriptionPricingArray);
export const starQuantities = pgEnum('star_quantities', starQuantitiesArray);
export const starPrices = pgEnum('star_prices', starPricingArray);
export const orderStatus = pgEnum('order_status', ['inProgress', 'completed']);

export const premiumTable = pgTable('premiums', {
    id : uuid('id').primaryKey().defaultRandom(),
    duration : subscriptionDuration('subscription_duration').notNull(),
    features : jsonb('features').$type<string[]>().default([]),
    tonPrice : subscriptionTonPrice('ton').notNull(),
    rialPrice : varchar('rial', { length : 30 }).notNull(),
    icon : varchar('icon', { length : 15 }).notNull(),
    createdAt : timestamp('created_at').defaultNow().notNull(),
    updatedAt : timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`).notNull()
}, table => ({
    durationTonPriceIdx : index('duration_ton_price_idx').on(table.duration, table.tonPrice),
    rialPriceIdx : index('premium_rial_price_idx').on(table.rialPrice)
}));

export const insertPremiumSchema = createInsertSchema(premiumTable);
export const selectPremiumSchema = createSelectSchema(premiumTable);

export type SelectPremium = InferSelectModel<typeof premiumTable>;
export type InsertPremium = InferInsertModel<typeof premiumTable>;

export const starTable = pgTable('stars', {
    id : uuid('id').primaryKey().defaultRandom(),
    stars : starQuantities('stars').notNull(),
    tonPrice : starPrices('ton').notNull(),
    rialPrice : varchar('rial', { length : 256 }).notNull(),
    createdAt : timestamp('created_at').defaultNow().notNull(),
    updatedAt : timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`).notNull()
}, table => ({
    starsTonPriceIdx: index('stars_ton_price_idx').on(table.stars, table.tonPrice),
    rialPriceIdx: index('star_rial_price_idx').on(table.rialPrice)
}));

export const insertStarSchema = createInsertSchema(starTable);
export const selectStarSchema = createSelectSchema(starTable);

export type InsertStar = InferInsertModel<typeof starTable>;
export type SelectStar = InferSelectModel<typeof starTable>;

export const orderTable = pgTable('orders', {
    id : uuid('id').primaryKey().defaultRandom(),
    status : orderStatus('status').default('inProgress').notNull(),
    userId : uuid('user_id').references(() => userTable.id).notNull(),
    premiumId : uuid('premium_id').references(() => premiumTable.id),
    starId : uuid('star_id').references(() => starTable.id),
    orderPlaced : timestamp('order_placed').defaultNow()
}, table => ({
    premiumOrStarCheck : check('premium_or_star_check',
        sql`COALESCE((${table.premiumId})::TEXT, '') <> '' OR COALESCE((${table.starId})::TEXT, '') <> ''`
    )
}));

export const orderInsertSchema = createInsertSchema(orderTable);
export const orderSelectSchema = createSelectSchema(orderTable);

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