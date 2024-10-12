import { eq, ne } from 'drizzle-orm';
import { db } from '..';
import { premiumTable, starTable } from '../../models/service.model';
import type { HistoriesSearchWithRL, InsertOrder, OrdersSearchWithRL, PickService, PickServicesTable, PickServiceTableReturnType, PickServiceType, SelectOrder, SelectPremium, SelectStar } from '../../types';
import { orderTable } from '../../models/schema';
import type { HistoryFilterOptions, OrderFiltersOption } from '../../schemas/zod.schema';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { PaginatedOrders } from '../cache/dashboard.cache';

export type UpdatesDetail = {id : string, totalTonAmount : number, totalTonPriceInIrr : number;};
export const updatePremiumPrice = async (updates : Array<UpdatesDetail>) : Promise<void> => {
    await Promise.all(updates.map(async update => {
        await db.update(premiumTable).set({irrPrice : update.totalTonPriceInIrr, tonQuantity : update.totalTonAmount})
        .where(eq(premiumTable.id, update.id))
    }));
}

export const updateStarPrices = async (updates : UpdatesDetail[]) => {
    await Promise.all(updates.map(async update => {
        await db.update(starTable).set({irrPrice : update.totalTonPriceInIrr, tonQuantity : update.totalTonAmount})
        .where(eq(starTable.id, update.id))
    }));
}

export const findManyService = async <Table extends PickServicesTable>(table : Table) : Promise<PickServiceTableReturnType<Table>> => {
    const selectTable : Record<PickServicesTable, PgTable> = { premiumTable, starTable };
    return await db.select().from(selectTable[table]) as PickServiceTableReturnType<Table>;
}

export const findServiceWithCondition = async <S extends PickService>(service : S, serviceId : string) : Promise<PickServiceType<S>> => {
    const table = service === 'star' ? starTable : premiumTable
    const columns = service === 'star' ? {} : <typeof premiumTable>{
        irrPrice : premiumTable.irrPrice, tonQuantity : premiumTable.tonQuantity, id : premiumTable.id
    };
    return (await db.select(columns).from(table).where(eq(table.id, serviceId)))[0] as PickServiceType<S>;
}

export const insertOrder = async (orderDetail : InsertOrder) : Promise<SelectOrder> => {
    return (await db.insert(orderTable).values(orderDetail).returning())[0]
}

export const findManyOrders = async (status : OrderFiltersOption['filter'], offset : number, limit : number) 
: Promise<Pick<PaginatedOrders, 'next'> & {service : OrdersSearchWithRL}> => {
    const whereConditionMap : Record<typeof status, any> = {
        all : undefined,
        completed : eq(orderTable.status, 'completed'),
        pending : ne(orderTable.status, 'completed')
    }
    const ordersCountPromise = db.$count(orderTable, whereConditionMap[status]);
    const ordersPromise = db.query.orderTable.findMany({
        columns : {id : true, orderPlaced : true, username : true, premiumId : true, status : true,
            paymentMethod : true, transactionId : true
        },
        where : whereConditionMap[status],
        offset : offset, limit : limit + offset,
        orderBy : (table, funcs) => funcs.desc(table.id),
    })
    const [totalOrders, orders] = await Promise.all([ordersCountPromise, ordersPromise]);
    const next : boolean = offset + limit < totalOrders;
    return {service : orders, next};
}

type ModifiedColumns = Omit<SelectOrder, 'premiumId' | 'starId' | 'paymentMethod'>;
export type FindFirstOrderRT<W, M> = W extends false ? M extends false ? SelectOrder : ModifiedColumns : ModifiedColumns & {
    star : Pick<SelectStar, 'id' | 'stars'> | null, premium : Pick<SelectPremium, 'id' | 'duration'> | null
}

export const findFirstOrder = async <W extends boolean, M extends boolean>(orderId : string, withRelation : W, modifiedColumns : M) 
: Promise<FindFirstOrderRT<W, M>> => {
    return await db.query.orderTable.findFirst({
        where : (table, funcs) => funcs.eq(table.id, orderId),
        columns : modifiedColumns ? {premiumId : false, starId : false, paymentMethod : false} : undefined,
        with : withRelation ? {star : {columns : {id : true, stars : true}}, premium : {columns : {id : true, duration : true}}} : undefined
    }) as FindFirstOrderRT<W, M>;
}

export const updateOrderStatus = async (orderId : string, status : SelectOrder['status']) => {
    await db.update(orderTable).set({status}).where(eq(orderTable.id, orderId));
}

export const findOrdersHistory = async (userId : string, status : HistoryFilterOptions['filter'], offset : number, limit : number) => {
    const whereConditionMap : Record<typeof status, any> = {
        all : undefined,
        completed : eq(orderTable.status, 'completed'),
        in_progress : eq(orderTable.status, 'in_progress'),
        pending : eq(orderTable.status, 'pending')
    }
    const historiesCountPromise = db.$count(orderTable, whereConditionMap[status]);
    const historiesPromise : Promise<HistoriesSearchWithRL> = db.query.orderTable.findMany({
        where : (table, funcs) => funcs.and(funcs.eq(table.userId, userId), whereConditionMap[status]),
        with : {premium : {columns : {duration : true}}, star : {columns : {stars : true}}},
        columns : {starId : false, premiumId : false, userId : false, irrPrice : false, tonQuantity : false},
        offset : offset, limit : offset + limit, orderBy : (table, funcs) => funcs.desc(table.id),
    });
    const [ historiesCount, histories ] = await Promise.all([historiesCountPromise, historiesPromise])
    const next : boolean = offset + limit < historiesCount;
    return { service : histories, next };
}