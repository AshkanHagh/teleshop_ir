import workersLength from '../utils/workersLength';
import WorkerPool from './worker';

export const sortAndSliceWorker = new WorkerPool(workersLength(), new URL('./sortorders.worker.ts', import.meta.url).href);
export const sortChunks = new WorkerPool(workersLength(), new URL('./sortchunks.worker.ts', import.meta.url).href);
export const historyWorker = new WorkerPool(workersLength(), new URL('./history.worker.ts', import.meta.url).href);
export const ordersWorker = new WorkerPool(workersLength(), new URL('./orderMap.worker.ts', import.meta.url).href);