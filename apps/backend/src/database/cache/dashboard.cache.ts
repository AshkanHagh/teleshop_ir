import type { Pipeline } from '@upstash/redis';
import redis from '../../libs/redis.config';
import { orderKeyById } from '../../utils/keys';
import type { OrdersFilterByStatusSchema } from '../../schemas/zod.schema';
import type { DrizzleSelectOrder } from '../../models/order.model';
import type { PaymentService } from '../queries/service.query';

export type ConditionalOrderCache = (Omit<DrizzleSelectOrder, 'starId' | 'premiumId' | 'userId'> & {service : PaymentService})
export const scanOrdersCache = async (status : OrdersFilterByStatusSchema['status']) : 
Promise<ConditionalOrderCache[]> => {
    let cursor = '0';
    const orders : ConditionalOrderCache[] = [];
    do {
        const [newCursor, keys] = await redis.scan(cursor, {match : orderKeyById('*'), count : 500});
        const pipeline : Pipeline<[]> = redis.pipeline();
        keys.forEach(key => pipeline.json.get(key, '$'));

        (await pipeline.exec() as DrizzleSelectOrder[][]).flat().filter(order => status === 'completed' 
            ? order.status === 'completed' : order.status !== 'completed'
        ).map(({id, orderPlaced, status, username, premiumId, paymentMethod}) => orders.push({
            id, orderPlaced, status, username, service : premiumId ? 'premium' : 'star', paymentMethod
        }));

        cursor = newCursor;
    } while (cursor !== '0');
    return orders;
}