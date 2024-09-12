import { relations, sql } from 'drizzle-orm';
import { pgEnum, pgTable, smallint, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { orderTable } from './schema';

export const userRole = pgEnum('role', ['shopper', 'customer']);

export const userTable = pgTable('users', {
    id : uuid('id').primaryKey().defaultRandom(),
    telegramId : smallint('telegram_id').notNull(),
    lastName : varchar('last_name').notNull(),
    username : varchar('username').notNull(),
    authDate : smallint('auth_date').notNull(),
    role : userRole('role').default('customer').notNull(),
    createdAt : timestamp('created_at').defaultNow().notNull(),
    updatedAt : timestamp('updated_at').defaultNow().$onUpdate(() => sql`now()`).notNull()
}, table => ({
    usernameIndex : uniqueIndex('username_unique_idx').on(table.username),
    usernameAndTelegramIdIdx : uniqueIndex('username_telegramId_idx').on(table.telegramId, table.username)
}));

export const userInsertSchema = createInsertSchema(userTable);
export const userSelectSchema = createSelectSchema(userTable);

export const userTableRelations = relations(userTable, ({many}) => ({
    order : many(orderTable)
}))