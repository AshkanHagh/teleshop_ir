import { check, index, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userTable } from './schema';
import { relations, sql } from 'drizzle-orm';

export const subscriptionDuration = pgEnum('subscription_duration', ['quarterly', 'semi_annually', 'annually']);
export const subscriptionTonPrice = pgEnum('subscription_ton_price', ['2.22', '2.96', '5.37']);
export const stars = pgEnum('star_rice', ['50', '75', '100', '150', '250', '350', '500', '750', '1000', 
    '1500', '2500', '5000', '10000', '25000'
]);
export const starTonPrice = pgEnum('star_rice', ['50', '75', '100', '150', '250', '350', '500', '750', '1000', 
    '1500', '2500', '5000', '10000', '25000'
]);
export const orderStatus = pgEnum('order_status', ['inProgress', 'completed']);

export const premiumServiceTable = pgTable('premiums_service', {
    id : uuid('id').primaryKey().defaultRandom(),
    duration : subscriptionDuration('subscription_period').notNull(),
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

export const premiumInsertSchema = createInsertSchema(premiumServiceTable);
export const premiumSelectSchema = createSelectSchema(premiumServiceTable);

export const starServiceTable = pgTable('stars_service', {
    id : uuid('id').primaryKey().defaultRandom(),
    stars : stars('stars').notNull(),
    tonPrice : starTonPrice('ton').notNull(),
    rialPrice : varchar('rial', { length : 256 }).notNull(),
    createdAt : timestamp('created_at').defaultNow().notNull(),
    updatedAt : timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`).notNull()
}, table => ({
    starsIdx: index('stars_idx').on(table.stars),
    tonPriceIdx: index('ton_price_idx').on(table.tonPrice),
    rialPriceIdx: index('star_rial_price_idx').on(table.rialPrice)
}));

export const starInsertSchema = createInsertSchema(starServiceTable);
export const starSelectSchema = createSelectSchema(starServiceTable);

export const orderTable = pgTable('orders', {
    id : uuid('id').primaryKey().defaultRandom(),
    username : varchar('username', { length : 256 }).notNull(),
    status : orderStatus('status').default('inProgress').notNull(),
    userId : uuid('user_id').references(() => userTable.id).notNull(),
    premiumId : uuid('premium_id').references(() => premiumServiceTable.id),
    starId : uuid('star_id').references(() => starServiceTable.id),
    orderPlaced : timestamp('order_placed').defaultNow()
}, table => ({
    userIdStatusIdx : index('user_id_status_idx').on(table.userId, table.status),
    usernameIdx : index('username_idx').on(table.username),
    premiumOrStarCheck : check('premium_or_star_check', 
        sql`COALESCE((${table.premiumId})::TEXT, '') <> '' OR COALESCE((${table.starId})::TEXT, '') <> ''`
    )
}));

export const orderInsertSchema = createInsertSchema(orderTable);
export const orderSelectSchema = createSelectSchema(orderTable);

export const premiumTableRelations = relations(premiumServiceTable, ({ many }) => ({
    orders : many(orderTable)
}));

export const starTableRelations = relations(starServiceTable, ({ many }) => ({
    orders : many(orderTable)
}));

export const orderTableRelations = relations(orderTable, ({ one }) => ({
    premium : one(premiumServiceTable, {
        fields : [orderTable.premiumId],
        references : [premiumServiceTable.id]
    }),
    star : one(starServiceTable, {
        fields : [orderTable.starId],
        references : [starServiceTable.id]
    }),
    user : one(userTable, {
        fields : [orderTable.userId],
        references : [userTable.id]
    })
}));