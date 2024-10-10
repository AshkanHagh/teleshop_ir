import { type HistoryFilterOptions } from '../schemas/zod.schema';
import type { DeepNotNull, SelectOrder } from '../types';
import { reverseInsertionSort } from '../utils';

type WorkerData = {histories : DeepNotNull<SelectOrder>[], status : HistoryFilterOptions['filter']}
self.onmessage = (event : MessageEvent) => {
    const { histories, status } = event.data as WorkerData; 
    const filterBaseOrderStatusMap = (history : SelectOrder, status : HistoryFilterOptions['filter']) => {
        const filtersMap : Record<typeof status, boolean> = {
            all : true,
            completed : history.status === 'completed',
            in_progress : history.status === 'in_progress',
            pending : history.status === 'pending'
        };
        return filtersMap[status];
    }

    const filteredHistories : DeepNotNull<SelectOrder>[] = histories.filter(history => filterBaseOrderStatusMap(history, status));
    if(filteredHistories.length) reverseInsertionSort(filteredHistories, 0, filteredHistories.length - 1);
    self.postMessage({ result : filteredHistories });
}