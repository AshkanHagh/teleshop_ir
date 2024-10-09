import { doublePrecision, jsonb, pgEnum, pgTable, real, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orderTable } from './schema';
import kuuid from 'kuuid';

export const subscriptionDuration = ['سه ماهه', 'شش ماهه', 'یک ساله'] as const;
export const starQuantity = ['50', '75', '100', '150', '250', '350', '500', '750', 
    '1000', '1500', '2500', '5000', '10000', '25000', '35000', '50000'
] as const;

export const subscriptionDurationEnum = pgEnum('duration', subscriptionDuration);
export const starQuantities = pgEnum('star', starQuantity);

export const premiumTable = pgTable('premiums', {
    id : text('id').primaryKey().$defaultFn(() => kuuid.id()),
    duration : subscriptionDurationEnum('duration').notNull(),
    features : jsonb('features').$type<string[]>().default([]),
    tonQuantity : real('ton').notNull(),
    irrPrice : doublePrecision('irr').notNull(),
    icon : varchar('icon', { length : 15 }).notNull(),
    createdAt : timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt : timestamp('updated_at').$defaultFn(() => new Date()).$onUpdateFn(() => new Date).notNull()
});

export const starTable = pgTable('stars', {
    id : text('id').primaryKey().$defaultFn(() => kuuid.id()),
    stars : starQuantities('stars').notNull(),
    tonQuantity : real('ton').notNull(),
    irrPrice : doublePrecision('irr').notNull(),
    createdAt : timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt : timestamp('updated_at').$defaultFn(() => new Date()).$onUpdateFn(() => new Date).notNull()
});

export const premiumTableRelations = relations(premiumTable, ({ many }) => ({
    orders : many(orderTable)
}));

export const starTableRelations = relations(starTable, ({ many }) => ({
    orders : many(orderTable)
}));