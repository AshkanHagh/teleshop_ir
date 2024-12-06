import { db } from "@shared/db/drizzle";
import { premiumTable, starTable, type SelectPremium, type SelectServices, type SelectStar } from "@shared/models/services.model";

export const getServices = async (): Promise<SelectServices[]> => {
    return await db.query.servicesTable.findMany();
}

const findManyStars = async (): Promise<SelectStar[]> => {
    return await db.query.starTable.findMany({
        orderBy: (fields, func) => func.asc(fields.stars)
    })
}

const findManyPremium = async (): Promise<SelectPremium[]> => {
    return await db.query.premiumTable.findMany();
}

export type Service<F> = F extends "premium" ? { premiums:  SelectPremium[] } : { stars: SelectStar[] }; 

export const findManyServiceByName = async (service: "premium" | "star"): Promise<Service<typeof service>> => {
    return service == "premium" 
        ? { premiums: await findManyPremium() }
        : { stars: await findManyStars() };
}

// export type UpdatesDetail = {id: string, totalTonAmount: number, totalTonPriceInIrr: number;};
// export const updatePremiumPrice = async (updates: Array<UpdatesDetail>): Promise<void> => {
//     await db.transaction(async trx => {
//         await Promise.all(updates.map(async update => {
//             await trx.update(premiumTable).set({irrPrice: update.totalTonPriceInIrr, tonQuantity: update.totalTonAmount})
//             .where(eq(premiumTable.id, update.id))
//         }));
//     })
// }

// export const updateStarPrices = async (updates: UpdatesDetail[]) => {
//     await db.transaction(async trx => {
//         await Promise.all(updates.map(async update => {
//             await trx.update(starTable).set({irrPrice: update.totalTonPriceInIrr, tonQuantity: update.totalTonAmount})
//             .where(eq(starTable.id, update.id))
//         }));
//     })
// }

// export const findManyService = async <Table extends PickServicesTable>(table: Table): Promise<PickServiceTableReturnType<Table>> => {
//     const selectTable: Record<PickServicesTable, PgTable> = { premiumTable, starTable };
//     return await db.select().from(selectTable[table]) as PickServiceTableReturnType<Table>;
// }