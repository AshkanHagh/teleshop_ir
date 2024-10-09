import type { ChunkDetail } from '../database/cache/dashboard.cache';
import type { OrderFiltersOption } from '../schemas/zod.schema';
import { reverseInsertionSort, reverseMergeSort } from '../utils';

type WorkerData = { chunk : ChunkDetail; status : OrderFiltersOption['filter']; useInsertionSort : boolean };
self.onmessage = (event : MessageEvent) => {
    const { chunk, status, useInsertionSort } = event.data as WorkerData;
    const filteredChunk : ChunkDetail['chunkData'] = status === 'all' ? chunk.chunkData : chunk.chunkData.filter(order => 
        status === 'completed' ? order.status === 'completed' : order.status !== 'completed'
    )
    
    if (!useInsertionSort) {
        const tempArray = new Array(filteredChunk.length);
        reverseMergeSort(filteredChunk, tempArray, 0, filteredChunk.length - 1);
    } else {
        reverseInsertionSort(filteredChunk, 0, filteredChunk.length - 1);
    }
    self.postMessage({ result : <ChunkDetail>{chunkData : filteredChunk, chunkIndex : chunk.chunkIndex}});
}