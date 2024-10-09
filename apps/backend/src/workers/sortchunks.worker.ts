import type { ChunkDetail } from '../database/cache/dashboard.cache';
import { chunksInsertionSort } from '../utils';

type WorkerData = { chunks : ChunkDetail[]; offset : number; limit : number };
self.onmessage = (event : MessageEvent) => {
    const { chunks } = event.data as WorkerData;
    chunksInsertionSort(chunks, 0, chunks.length - 1);
    self.postMessage({ result : chunks.map(chunk => chunk.chunkData.map(chunk => chunk.id))});
}