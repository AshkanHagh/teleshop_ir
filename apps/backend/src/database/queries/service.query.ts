import { eq, sql } from 'drizzle-orm';
import { db } from '..';
import { premiumTable, starTable, type DrizzleSelectPremium, type DrizzleSelectStar, 
    type PremiumDuration
 } from '../../models/service.model';

export type PremiumUpdates = {duration : PremiumDuration, ton : number, irr : number;}
export const updatePremiumTonAndRialPrice = async (updates : Array<PremiumUpdates>) : Promise<DrizzleSelectPremium> => {
    return await db.transaction(async trx => {
        const [premium] = await Promise.all(updates.map(async update => {
            const premium = await trx.execute(sql<DrizzleSelectPremium>`
                UPDATE ${premiumTable} SET ${premiumTable.ton_quantity} = ${update.ton}, ${premiumTable.irr_price} = ${update.irr}
                WHERE ${premiumTable.duration} = ${update.duration} RETURNING *
            `)
            return premium[0] as DrizzleSelectPremium;
        }));
        return premium;
    })
}

type SelectTable = 'starTable' | 'premiumTable';
const selectTable = <Record<SelectTable, any>>{premiumTable, starTable}; 
type SelectedTableResult<Table> = Table extends 'starTable' ? DrizzleSelectStar[] : DrizzleSelectPremium[];

export const findMany = async <Table extends SelectTable>(table : Table) : Promise<SelectedTableResult<Table>> => {
    return await db.select().from(selectTable[table]) as SelectedTableResult<Table>;
}

export type OrderService = 'star' | 'premium';
export type DesiredService<Service> = Service extends 'star' ? DrizzleSelectStar : DrizzleSelectPremium;

export const findServiceWithCondition = async <S extends OrderService>(service : S, serviceId : string) : Promise<DesiredService<S>> => {
    const table = service === 'star' ? starTable : premiumTable
    const columns = service === 'star' ? {} : <typeof premiumTable>{
        irr_price : premiumTable.irr_price, ton_quantity : premiumTable.ton_quantity, id : premiumTable.id
    };
    return (await db.select(columns).from(table).where(eq(table.id, serviceId)))[0] as DesiredService<S>;
}