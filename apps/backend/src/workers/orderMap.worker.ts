import type { DeepNotNull, PublicOrder, SelectOrder } from '../types';

type WorkerData = { orders : DeepNotNull<SelectOrder>[]; };
self.onmessage = (event : MessageEvent) => {
    const { orders } = event.data as WorkerData;
    const modifiedOrders : Omit<PublicOrder, 'transactionId'>[] = orders.map(order => {
        const { id, orderPlaced, status, username, premiumId, paymentMethod } = order;
        return { id, orderPlaced, status, username, service : premiumId ? 'premium' : 'star', paymentMethod };
    });
    self.postMessage({ result : modifiedOrders });
}