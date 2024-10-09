import type { Pipeline } from '@upstash/redis';
import redis from '../../libs/redis.config';
import type { PublicOrder, SelectOrder } from '../../types';
import type { OrderFiltersOption } from '../../schemas/zod.schema';
import { orderKeyById, orderIndexKey } from '../../utils';
import workersLength from '../../utils/workersLength';
import { ordersWorker, sortAndSliceWorker, sortChunks } from '../../workers/workerPools';

export type ChunkDetail = { chunkData : Pick<SelectOrder, 'id' | 'status'>[], chunkIndex : number };
export const scanOrdersCache = async (status : OrderFiltersOption['filter'], offset : number, limit : number) 
: Promise<PublicOrder[] | null> => {
    const ordersIndex = await redis.json.get(orderIndexKey()) as Pick<SelectOrder, 'id' | 'status'>[] | null;
    if(!ordersIndex) return null;

    const chunkSize : number = Math.ceil(ordersIndex.length / workersLength());
    const chunks : ChunkDetail[] = [];
    let chunkIndex : number = 0;
    for (let i : number = 0; i < ordersIndex.length; i += chunkSize) {
        chunks.push({chunkData : ordersIndex.slice(i, i + chunkSize), chunkIndex : chunkIndex++});
    }

    const sortedAndFilteredChunks = await Promise.all(chunks.map(async chunk => {
        return await sortAndSliceWorker.runWorker({chunk, status, useInsertionSort : chunk.chunkData.length < 1000});
    })) as ChunkDetail[] | null;
    if(!sortedAndFilteredChunks) return null;
    const indexedOrdersId = await sortChunks.runWorker({chunks : sortedAndFilteredChunks}) as string[][];
    const paginatedOrdersId : string[] = indexedOrdersId.flat().slice(offset, limit + offset);
    if(!paginatedOrdersId.length) return null;

    const pipeline : Pipeline<[]> = redis.pipeline();
    paginatedOrdersId.forEach(id => pipeline.json.get(orderKeyById(id)));
    const ordersCache : SelectOrder[] = await pipeline.exec();
    const modifiedOrders = await ordersWorker.runWorker({ orders : ordersCache }) as PublicOrder[];
    return modifiedOrders;
};