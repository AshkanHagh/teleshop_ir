import { pgTable, timestamp, pgEnum, varchar, text, doublePrecision, index, integer } from 'drizzle-orm/pg-core';
import { userTable, premiumTable, starTable } from './schema';
import { relations } from 'drizzle-orm';
import kuuid from 'kuuid';

export const orderStatus = pgEnum('order_status', ['pending', 'in_progress', 'completed']);
export const paymentMethod = pgEnum('paymentMethod', ['IRR', 'TON']);

export const orderTable = pgTable('orders', {
    id : text('id').primaryKey().$defaultFn(() => kuuid.id()),
    username : varchar('username', {length : 256}).notNull(),
    status : orderStatus('status').default('pending').notNull(),
    paymentMethod : paymentMethod('payment_method').notNull(),
    irrPrice : doublePrecision('irr_price').notNull(),
    tonQuantity : doublePrecision('ton_quantity').notNull(),
    transactionId : integer('transaction_id').notNull(),
    userId : text('user_id').references(() => userTable.id, {onDelete : 'cascade'}).notNull(),
    premiumId : text('premium_id').references(() => premiumTable.id, {onDelete : 'cascade'}),
    starId : text('star_id').references(() => starTable.id, {onDelete : 'cascade'}),
    orderPlaced : timestamp('order_placed').$defaultFn(() => new Date()).notNull()
}, table => ({
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