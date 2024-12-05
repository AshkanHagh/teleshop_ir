import { db } from "@shared/db/drizzle";
import type { HistoryFilterOptions, OrderFiltersOption } from "../../schema";
import type { HistoriesSearchWithRL, OrdersSearchWithRL, PaginatedOrders, SelectOrderTable, SelectPremiumTable, SelectStarTable } from "@shared/types";
import { orderTable } from "@shared/models/schemas/order.model";
import { eq, ne } from "drizzle-orm";

export const findManyOrders = async (status: OrderFiltersOption["filter"], offset: number, limit: number) 
: Promise<Pick<PaginatedOrders, "next"> & {service: OrdersSearchWithRL}> => {
    // i will find eq type later
    const whereConditionMap: Record<typeof status, any> = {
        all: undefined,
        completed: eq(orderTable.status, "completed"),
        pending: eq(orderTable.status, "pending"),
        in_progress: eq(orderTable.status, "in_progress")
    }
    const ordersCountPromise = db.$count(orderTable, whereConditionMap[status]);
    const ordersPromise = db.query.orderTable.findMany({
        columns: {id: true, orderPlaced: true, username: true, premiumId: true, status: true,
            paymentMethod: true
        },
        where: whereConditionMap[status], offset: offset, limit: limit + offset, orderBy: (table, funcs) => funcs.desc(table.id),
    })
    const [ordersCount, orders] = await Promise.all([ordersCountPromise, ordersPromise]);
    const next: boolean = offset + limit < ordersCount;
    return { service: orders, next };
}

type ModifiedColumns = Omit<SelectOrderTable, "premiumId" | "starId" | "paymentMethod">;
export type FindFirstOrderRT<W, M> = W extends false ? M extends false ? SelectOrderTable: ModifiedColumns: ModifiedColumns & {
    star: Pick<SelectStarTable, "id" | "stars"> | null, premium: Pick<SelectPremiumTable, "id" | "duration"> | null
}

export const findFirstOrder = async <W extends boolean, M extends boolean>(orderId: string, withRelation: W, modifiedColumns: M) 
: Promise<FindFirstOrderRT<W, M>> => {
    return await db.query.orderTable.findFirst({
        where: (table, funcs) => funcs.eq(table.id, orderId),
        columns: modifiedColumns ? {premiumId: false, starId: false, paymentMethod: false}: undefined,
        with: withRelation ? {star: {columns: {id: true, stars: true}}, premium: {columns: {id: true, duration: true}}}: undefined
    }) as FindFirstOrderRT<W, M>;
}

export const updateOrderStatus = async (orderId: string, status: SelectOrderTable["status"]) => {
    await db.update(orderTable).set({status}).where(eq(orderTable.id, orderId));
}

export const findOrdersHistory = async (userId: string, status: HistoryFilterOptions["filter"], offset: number, limit: number) => {
    const whereConditionMap: Record<typeof status, any> = {
        all: undefined,
        completed: eq(orderTable.status, "completed"),
        in_progress: eq(orderTable.status, "in_progress"),
        pending: eq(orderTable.status, "pending")
    }
    const historiesCountPromise = db.$count(orderTable, whereConditionMap[status]);
    const historiesPromise: Promise<HistoriesSearchWithRL> = db.query.orderTable.findMany({
        where: (table, funcs) => funcs.and(funcs.eq(table.userId, userId), whereConditionMap[status]),
        with: {premium: {columns: {duration: true}}, star: {columns: {stars: true}}},
        columns: {starId: false, premiumId: false, userId: false, irrPrice: false, tonQuantity: false},
        offset: offset, limit: offset + limit, orderBy: (table, funcs) => funcs.desc(table.id),
    });
    const [ historiesCount, histories ] = await Promise.all([historiesCountPromise, historiesPromise])
    const next: boolean = offset + limit < historiesCount;
    return { service: histories, next };
}
export type ManyOrdersWithRelationsRT = ReturnType<typeof findOrdersHistory>;