import { relations, sql } from 'drizzle-orm';
import { integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { orderTable } from './schema';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export const initialRoles = pgEnum('role', ['shopper', 'customer']);
export type InitialRoles = 'shopper' | 'customer';

export const userTable = pgTable('users', {
    id : uuid('id').primaryKey().defaultRandom(),
    telegram_id : integer('telegram_id').notNull(),
    last_name : varchar('last_name').notNull(),
    username : varchar('username').notNull(),
    role : initialRoles('role').default('customer').notNull(),
    created_at : timestamp('created_at').defaultNow().notNull(),
    updated_at : timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`).notNull()
}, table => ({
    username_unique_idx : uniqueIndex('username_unique_idx').on(table.username),
    username_telegramId_idx : uniqueIndex('username_telegramId_idx').on(table.telegram_id, table.username)
}));

export const insertUserSchema = createInsertSchema(userTable);
export const selectUserSchema = createSelectSchema(userTable);

export type SelectUser = InferSelectModel<typeof userTable>;
export type InsertUser = InferInsertModel<typeof userTable>;

export const userTableRelations = relations(userTable, ({ many }) => ({
    order : many(orderTable)
}));