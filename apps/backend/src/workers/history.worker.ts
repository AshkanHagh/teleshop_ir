import { type HistoryFilterOptions } from '../schemas/zod.schema';
import type { DeepNotNull, SelectOrder } from '../types';
import { reverseInsertionSort } from '../utils';

type WorkerData = {histories : DeepNotNull<SelectOrder>[], status : HistoryFilterOptions['filter']}
self.onmessage = (event : MessageEvent) => {
    const { histories, status } = event.data as WorkerData;
    async function filterBaseOrderStatusMap(order : SelectOrder) {
        return <Record<typeof status, any>>{
            all : undefined,
            completed : order.status === 'completed',
            in_progress : order.status === 'in_progress',
            pending : order.status === 'pending'
        }
    }
    const filteredHistories : DeepNotNull<SelectOrder>[] = histories.filter(history => filterBaseOrderStatusMap(history));
    reverseInsertionSort(filteredHistories, 0, filteredHistories.length - 1);
    self.postMessage({ result : filteredHistories });
}