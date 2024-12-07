import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { userTable } from "./user.model";
import { premiumTable, starTable } from "./services.model";

export const orderStatus = pgEnum("order_status", ["pending", "in_progress", "completed"]);
export const orderedServiceType = pgEnum("type", ["premium", "star"]);

export const orderedServiceTable = pgTable("ordered_services", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    userId: table.uuid().references(() => userTable.id, { onDelete: "cascade" }),
    type: orderedServiceType().notNull(),
    premiumId: table.uuid().references(() => premiumTable.id, {onDelete: "cascade"}),
    starId: table.uuid().references(() => starTable.id, {onDelete: "cascade"}),
}));

export type InsertOrderedService = InferInsertModel<typeof orderedServiceTable>;
export type SelectOrderedService = InferSelectModel<typeof orderedServiceTable>;

export const orderTable = pgTable("orders", table => ({
    id: table.uuid().primaryKey().defaultRandom().notNull(),
    username: table.varchar({length: 256}).notNull(),
    status: orderStatus().default("pending").notNull(),
    ton: table.integer().notNull(),
    irr: table.integer().notNull(),
    transactionId: table.integer().notNull(),
    serviceId: table.uuid().references(() => orderedServiceTable.id).notNull(),
    orderPlaced: table.timestamp().$defaultFn(() => new Date()).notNull()
}), table => ({
    statusIdx: index("order_status_idx").on(table.status),
    orderPlacesIdx: index("order_places_idx").using("btree", table.orderPlaced)
}));

export type InsertOrder = InferInsertModel<typeof orderTable>;
export type SelectOrder = InferSelectModel<typeof orderTable>;

export const orderTableRelations = relations(orderTable, ({ one }) => ({
    service: one(orderedServiceTable, {
        fields: [orderTable.serviceId],
        references: [orderedServiceTable.id]
    })
}));

export const orderedServiceTableRelations = relations(orderedServiceTable, ({ one }) => ({
    order: one(orderTable, {
        fields: [orderedServiceTable.id],
        references: [orderTable.serviceId]
    }),
    customer: one(userTable, {
        fields: [orderedServiceTable.userId],
        references: [userTable.id]
    }),
    premium: one(premiumTable, {
        fields: [orderedServiceTable.premiumId],
        references: [premiumTable.id]
    }),
    star: one(starTable, {
        fields: [orderedServiceTable.starId],
        references: [starTable.id]
    }),
}));