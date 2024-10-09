import { relations } from 'drizzle-orm';
import { integer, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { orderTable } from './schema';
import type { InitRoles } from '../types';
import kuuid from 'kuuid';

export const userTable = pgTable('users', {
    id : text('id').primaryKey().$defaultFn(() => kuuid.id()),
    telegramId : integer('telegram_id').notNull(),
    lastName : varchar('last_name').notNull(),
    username : varchar('username').unique().notNull(),
    roles : jsonb('roles').$type<InitRoles>().default(['customer']).notNull(),
    createdAt : timestamp('created_at').$defaultFn(() => new Date()).notNull(),
    updatedAt : timestamp('updated_at').$defaultFn(() => new Date()).$onUpdateFn(() => new Date).notNull()
});

export const userTableRelations = relations(userTable, ({ many }) => ({
    order : many(orderTable)
}));