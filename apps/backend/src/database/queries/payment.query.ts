import { db } from '..';
import { orderTable, type drizzleInsertOrder, type drizzleSelectOrder } from '../../models/order.model';

export const insertOrder = async (orderDetail : drizzleInsertOrder) : Promise<drizzleSelectOrder> => {
    return (await db.insert(orderTable).values(orderDetail).returning())[0]
}