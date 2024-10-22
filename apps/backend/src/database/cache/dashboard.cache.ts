import type { ChainableCommander } from 'ioredis';
import RedisMethod, { type IndexSearch } from '.';
import { order } from '../../controllers/dashboard.controller';
import type { OrderFiltersOption } from '../../schemas/zod.schema';
import type { PaginatedOrders, PublicOrder, SelectOrder } from '@types';
import { orderIndexKey, orderKeyById } from '@utils/.';
import redis from '@libs/redis.config';

export type ChunkDetail = { chunkData : Pick<SelectOrder, 'id' | 'status'>[], chunkIndex : number };
type IndexedOrder = Pick<SelectOrder, 'id' | 'status' | 'orderPlaced'>;

export const scanOrdersCache = async (status : OrderFiltersOption['filter'], offset : number, limit : number) 
: Promise<PaginatedOrders | null> => {

    const withFilter = async () : Promise<PaginatedOrders | null> => {
        const orders : IndexSearch<SelectOrder> | null = await RedisMethod.indexSearch('orderIdx', `@status:{${status}}`, 
            'LIMIT', `${offset}`, `${limit}`
        )
        if(!orders || !order.length) return null;
        const modifiedOrders : Omit<PublicOrder, 'transactionId'>[] = orders.data.map(order => {
            const { id, orderPlaced, status, username, premiumId, paymentMethod } = order;
            return { id, orderPlaced, status, username, service : premiumId ? 'premium' : 'star', paymentMethod };
        });
        modifiedOrders.sort((a, b) => new Date(b.orderPlaced).getTime() - new Date(a.orderPlaced).getTime());
        const next : boolean = offset + limit < orders.totalItem;
        return { service : modifiedOrders, next };
    }

    const withoutFilter = async () => {
        const indexedOrders : IndexedOrder[] | undefined = (await RedisMethod.jsonget(orderIndexKey(), '$') as 
            IndexedOrder[][] | null)?.flat();
        if(!indexedOrders || !order.length) return null;
        indexedOrders.sort((a, b) => new Date(b.orderPlaced).getTime() - new Date(a.orderPlaced).getTime());
    
        const next : boolean = offset + limit < indexedOrders.length;
        const paginatedOrdersId : IndexedOrder[] = indexedOrders.slice(offset, limit + offset);
    
        const pipeline : ChainableCommander = redis.pipeline();
        paginatedOrdersId.forEach(order => RedisMethod.pipelineJsonget(pipeline, orderKeyById(order.id), '$'))
        const ordersCache = (await pipeline.exec())!.map(rs => JSON.parse(rs[1] as string)).flat() as SelectOrder[];
        const modifiedOrders : Omit<PublicOrder, 'transactionId'>[] = ordersCache.map(order => {
            const { id, orderPlaced, status, username, premiumId, paymentMethod } = order;
            return { id, orderPlaced, status, username, service : premiumId ? 'premium' : 'star', paymentMethod };
        });
        return { service : modifiedOrders, next };
    }
    return status === 'all' ? await withoutFilter() : await withFilter()
};