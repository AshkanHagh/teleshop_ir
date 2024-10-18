import { relations } from 'drizzle-orm';
import { pgEnum, pgTable } from 'drizzle-orm/pg-core';
import { orderTable } from './order.model';

export const subscriptionDuration = ['سه ماهه', 'شش ماهه', 'یک ساله'] as const;
export const starQuantity = ['50', '75', '100', '150', '250', '350', '500', '750', 
    '1000', '1500', '2500', '5000', '10000', '25000', '35000', '50000'
] as const;

export const subscriptionDurationEnum = pgEnum('duration', subscriptionDuration);
export const starQuantities = pgEnum('star', starQuantity);

export const premiumTable = pgTable('premiums', table => ({
    id : table.uuid().primaryKey().defaultRandom(),
    duration : subscriptionDurationEnum().notNull(),
    features : table.jsonb().$type<string[]>().default([]),
    tonQuantity : table.numeric({precision : 7, scale : 2}).$type<number>().notNull(),
    irrPrice : table.numeric({precision : 12, scale : 2}).$type<number>().notNull(),
    icon : table.varchar({ length : 15 }).notNull(),
    createdAt : table.timestamp().$defaultFn(() => new Date()).notNull(),
    updatedAt : table.timestamp().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull()
}));

export const starTable = pgTable('stars', table => ({
    id : table.uuid().primaryKey().defaultRandom(),
    stars : starQuantities('stars').notNull(),
    tonQuantity : table.numeric({precision : 7, scale : 2}).$type<number>().notNull(),
    irrPrice : table.numeric({precision : 12, scale : 2}).$type<number>().notNull(),
    createdAt : table.timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt : table.timestamp('updated_at').$defaultFn(() => new Date()).$onUpdateFn(() => new Date).notNull()
}));

export const premiumTableRelations = relations(premiumTable, ({ many }) => ({
    orders : many(orderTable)
}));

export const starTableRelations = relations(starTable, ({ many }) => ({
    orders : many(orderTable)
}));