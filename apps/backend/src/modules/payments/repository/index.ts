import { db } from "@shared/db/drizzle";
import { orderedServiceTable, orderTable, type InsertOrder, type InsertOrderedService, type SelectOrder } from "@shared/models/order.model";

const findStarById = async (id: string) => {
    return await db.query.starTable.findFirst({
        where: (fields, funcs) => funcs.eq(fields.id, id),
        columns: {
            ton: true,
            irr: true,
        }
    })
}

const findPremiumById = async (id: string) => {
    return await db.query.premiumTable.findFirst({
        where: (fields, funcs) => funcs.eq(fields.id, id),
        columns: {
            ton: true,
            irr: true,
        }
    })
}


export const findServicePriceByNameAndId = async (service: "premium" | "star", id: string) => {
    return service == "premium" ? findPremiumById(id) : findStarById(id);
}

export const insertOrder = async (orderDetail: Omit<InsertOrder, "serviceId">, serviceDetail: InsertOrderedService) => {
    let orderedServiceId = crypto.randomUUID();
    await db.transaction(async trx => {
        await trx.insert(orderedServiceTable).values({
            ...serviceDetail,
            id: orderedServiceId
        });

        await trx.insert(orderTable).values({
            ...orderDetail,
            serviceId: orderedServiceId
        });
    })
}