import { eq } from 'drizzle-orm';
import type { PickServicesTable, PickServiceTableReturnType } from '@shared/types';
import type { PgTable } from 'drizzle-orm/pg-core';
import { premiumTable, starTable } from '@shared/db/schemas/services.model'
import { db } from '@shared/db';

export type UpdatesDetail = {id : string, totalTonAmount : number, totalTonPriceInIrr : number;};
export const updatePremiumPrice = async (updates : Array<UpdatesDetail>) : Promise<void> => {
    await db.transaction(async trx => {
        await Promise.all(updates.map(async update => {
            await trx.update(premiumTable).set({irrPrice : update.totalTonPriceInIrr, tonQuantity : update.totalTonAmount})
            .where(eq(premiumTable.id, update.id))
        }));
    })
}

export const updateStarPrices = async (updates : UpdatesDetail[]) => {
    await db.transaction(async trx => {
        await Promise.all(updates.map(async update => {
            await trx.update(starTable).set({irrPrice : update.totalTonPriceInIrr, tonQuantity : update.totalTonAmount})
            .where(eq(starTable.id, update.id))
        }));
    })
}

export const findManyService = async <Table extends PickServicesTable>(table : Table) : Promise<PickServiceTableReturnType<Table>> => {
    const selectTable : Record<PickServicesTable, PgTable> = { premiumTable, starTable };
    return await db.select().from(selectTable[table]) as PickServiceTableReturnType<Table>;
}