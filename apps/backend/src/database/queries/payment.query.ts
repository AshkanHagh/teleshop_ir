import { eq } from 'drizzle-orm';
import { db } from '..';
import { orderTable, type DrizzleInsertOrder, type DrizzleSelectOrder } from '../../models/order.model';
import type { OrdersFilterByStatusSchema } from '../../schemas/zod.schema';

export const insertOrder = async (orderDetail : DrizzleInsertOrder) : Promise<DrizzleSelectOrder> => {
    return (await db.insert(orderTable).values(orderDetail).returning())[0]
}

export const findManyOrders = async (status : OrdersFilterByStatusSchema['status'], offset : number, limit : number) => {
    return await db.query.orderTable.findMany({
        columns : {id : true, orderPlaced : true, username : true, premiumId : true},
        where : (table, funcs) => status === 'completed' ? funcs.eq(table.status, 'completed') : funcs.ne(table.status, 'completed'),
        offset : offset, limit : limit + offset
    })
}
export type OrdersPlaced = ReturnType<typeof findManyOrders>;

export const findFirstOrder = async (orderId : string, trx = db) => {
    return await trx.query.orderTable.findFirst({
        where : (table, {eq}) => eq(table.id, orderId),
        columns : {premiumId : false, starId : false},
        with : {star : {columns : {id : true, irr_price : true, stars : true, ton_quantity : true}}, premium : {columns : {
            id : true, duration : true, irr_price : true, ton_quantity : true
        }}}
    })
}
export type OrderPlaced = Awaited<ReturnType<typeof findFirstOrder>>;

export const updateOrderStatus = async (orderId : string, status : DrizzleSelectOrder['status']) => {
    await db.update(orderTable).set({status}).where(eq(orderTable.id, orderId));
}

export const findOrdersHistory = async (userId : string, status : OrdersFilterByStatusSchema['status'], offset : number, limit : number) => {
    return await db.query.orderTable.findMany({
        where : (table, funcs) => funcs.and(funcs.eq(table.userId, userId), 
            status === 'completed' ? funcs.eq(table.status, 'completed') : funcs.ne(table.status, 'completed')
        ),
        with : {premium : {columns : {duration : true}}, star : {columns : {stars : true}}},
        offset : offset, limit : offset + limit, orderBy : (table, funcs) => funcs.desc(table.orderPlaced)
    })
}
export type FindOrdersHistoryRT = Awaited<ReturnType<typeof findOrdersHistory>>