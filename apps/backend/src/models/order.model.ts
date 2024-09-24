import { pgTable, uuid, timestamp, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { userTable, premiumTable, starTable } from './schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';

export const orderStatus = pgEnum('order_status', ['pending', 'in_progress', 'completed']);
export const paymentMethod = pgEnum('paymentMethod', ['IRR', 'TON']);

export const orderTable = pgTable('orders', {
    id : uuid('id').primaryKey().defaultRandom(),
    username : varchar('username', {length : 256}).notNull(),
    status : orderStatus('status').default('pending').notNull(),
    paymentMethod : paymentMethod('payment_method').notNull(),
    userId : uuid('user_id').references(() => userTable.id).notNull(),
    premiumId : uuid('premium_id').references(() => premiumTable.id),
    starId : uuid('star_id').references(() => starTable.id),
    orderPlaced : timestamp('order_placed').defaultNow()
});

export const drizzleOrderInsertSchema = createInsertSchema(orderTable);
export const drizzleOrderSelectSchema = createSelectSchema(orderTable);

export type DrizzleInsertOrder = InferInsertModel<typeof orderTable>
export type DrizzleSelectOrder = InferSelectModel<typeof orderTable>;

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