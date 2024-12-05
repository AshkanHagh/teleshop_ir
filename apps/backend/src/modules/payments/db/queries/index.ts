import type { InsertOrderTable, PickService, PickServiceType, SelectOrderTable } from "@shared/types";
import { premiumTable, starTable } from "@shared/models/schemas/services.model"
import { orderTable } from "@shared/models/schemas/order.model"
import { db } from "@shared/db/drizzle";
import { eq } from "drizzle-orm";

export const findServiceWithCondition = async <S extends PickService>(service: S, serviceId: string): Promise<PickServiceType<S>> => {
    const table = service === "star" ? starTable: premiumTable
    const columns = service === "star" ? <typeof starTable>{
        irrPrice: starTable.irrPrice, tonQuantity: starTable.tonQuantity, id: starTable.id
    }: <typeof premiumTable>{
        irrPrice: premiumTable.irrPrice, tonQuantity: premiumTable.tonQuantity, id: premiumTable.id
    };
    return (await db.select(columns).from(table).where(eq(table.id, serviceId)))[0] as PickServiceType<S>;
}

export const InsertOrderTableFn = async (orderDetail: InsertOrderTable): Promise<SelectOrderTable> => {
    return (await db.insert(orderTable).values(orderDetail).returning())[0]
}