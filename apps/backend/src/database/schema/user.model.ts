import { pgTable } from 'drizzle-orm/pg-core';
import type { InitRoles } from '../../types';
import { relations } from 'drizzle-orm';
import { orderTable } from './order.model';

export const userTable = pgTable('users', table => ({
    id : table.uuid().primaryKey().defaultRandom(),
    telegramId : table.integer().notNull(),
    lastName : table.varchar().notNull(),
    username : table.varchar().unique().notNull(),
    roles : table.jsonb().$type<InitRoles>().default(['customer']).notNull(),
    createdAt : table.timestamp().$defaultFn(() => new Date()).notNull(),
    updatedAt : table.timestamp().$defaultFn(() => new Date()).$onUpdateFn(() => new Date).notNull()
}))

export const userTableRelations = relations(userTable, ({ many }) => ({
    order : many(orderTable)
}));