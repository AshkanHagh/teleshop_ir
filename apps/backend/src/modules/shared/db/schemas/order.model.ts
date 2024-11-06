import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable } from 'drizzle-orm/pg-core';
import { userTable } from './user.model';
import { premiumTable, starTable } from './services.model';

export const orderStatus = pgEnum('order_status', ['pending', 'in_progress', 'completed']);
export const paymentMethod = pgEnum('paymentMethod', ['IRR', 'TON']);

export const orderTable = pgTable('orders', table => ({
    id : table.uuid().primaryKey().defaultRandom().notNull(),
    username : table.varchar({length : 256}).notNull(),
    status : orderStatus().default('pending').notNull(),
    paymentMethod : paymentMethod().notNull(),
    tonQuantity : table.integer().notNull(),
    irrPrice : table.integer().notNull(),
    transactionId : table.integer().notNull(),
    userId : table.uuid().references(() => userTable.id, {onDelete : 'cascade'}).notNull(),
    premiumId : table.uuid().references(() => premiumTable.id, {onDelete : 'cascade'}),
    starId : table.uuid().references(() => starTable.id, {onDelete : 'cascade'}),
    orderPlaced : table.timestamp().$defaultFn(() => new Date()).notNull()
}), table => ({
    statusIdx : index('order_status_idx').on(table.status),
    userIdAndStatusIdx : index('order_user_id_status_idx').on(table.userId, table.status)
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