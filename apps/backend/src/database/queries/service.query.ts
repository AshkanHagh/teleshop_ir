import { eq, sql } from 'drizzle-orm';
import { db } from '..';
import { premiumTable, starTable, type DrizzleSelectPremium, type DrizzleSelectStar } from '../../models/service.model';

export type UpdatesDetail = {id : string, totalTonAmount : number, totalTonPriceInIrr : number;};
export const updatePremiumTonAndRialPrice = async (updates : Array<UpdatesDetail>) : Promise<void> => {
    await db.transaction(async trx => {
        await Promise.all(updates.map(async update => {
            await trx.execute(sql`UPDATE ${premiumTable} SET ${premiumTable.ton_quantity} = 
                ${update.totalTonAmount}, ${premiumTable.irr_price} = ${update.totalTonPriceInIrr}
                WHERE ${premiumTable.id} = ${update.id}
            `)
        }));
    })
}
export const updateStarPrices = async (updates : UpdatesDetail[]) => {
    await db.transaction(async trx => {
        await Promise.all(updates.map(async update => {
            await trx.execute(sql`UPDATE ${starTable} SET ${starTable.ton_quantity} = ${update.totalTonAmount}, 
                ${starTable.irr_price} = ${update.totalTonPriceInIrr} WHERE ${starTable.id} = ${update.id}
            `)
        }))
    })
}

type SelectTable = 'starTable' | 'premiumTable';
const selectTable = <Record<SelectTable, any>>{premiumTable, starTable}; 
type SelectedTableResult<Table> = Table extends 'starTable' ? DrizzleSelectStar[] : DrizzleSelectPremium[];

export const findMany = async <Table extends SelectTable>(table : Table) : Promise<SelectedTableResult<Table>> => {
    return await db.select().from(selectTable[table]) as SelectedTableResult<Table>;
}

export type PaymentService = 'star' | 'premium';
export type DesiredService<Service extends PaymentService> = Service extends 'star' ? DrizzleSelectStar : DrizzleSelectPremium;

export const findServiceWithCondition = async <S extends PaymentService>(service : S, serviceId : string) : Promise<DesiredService<S>> => {
    const table = service === 'star' ? starTable : premiumTable
    const columns = service === 'star' ? {} : <typeof premiumTable>{
        irr_price : premiumTable.irr_price, ton_quantity : premiumTable.ton_quantity, id : premiumTable.id
    };
    return (await db.select(columns).from(table).where(eq(table.id, serviceId)))[0] as DesiredService<S>;
}