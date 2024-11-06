import { faker } from '@faker-js/faker';
import { db } from '@shared/db';
import { orderTable } from '@shared/db/schemas/order.model';
import { logger } from '@shared/libs/winston';
import type { FakeOrderSeedingWorkerData, InsertOrderTable, PickServicePricing, SelectPremiumTable, SelectStarTable, SelectUserTable } from '@shared/types';
import type ErrorHandler from '@shared/utils/errorHandler';
import { parentPort, workerData } from 'worker_threads';

const { batchSize, maxOrders, premiums, stars, users } = workerData as FakeOrderSeedingWorkerData;
const generateBulkOrders = async (batchSize : number = 10000) => {
    try {
        logger.info(`Generating bulk orders started with : ${batchSize} batch size on ${maxOrders} max orders`);

        if(!premiums || !stars || !users) {
            throw new Error('Generating orders failed because lake of data make sure you send all premiums stars and users');
        }
        const orderStream : InsertOrderTable[] = [];
        for (let i : number = 0; i < users.length; i += batchSize) {
            const userBatch : SelectUserTable[] = users.slice(i, i + batchSize);
            const batchedOrders = await Promise.all(userBatch.map(user => generateOrdersForUser(premiums, stars, user, maxOrders)));
    
            orderStream.push(...batchedOrders.flat());
            if(orderStream.length >= batchSize * 20) {
                const orders = await db.insert(orderTable).values(orderStream).returning();
                orderStream.length = 0;
            }
            if(orderStream.length > 0) {
                const orders = await db.insert(orderTable).values(orderStream).returning();
            }
        }
        parentPort?.postMessage('done');
        
    } catch (error) {
        logger.error(`An error occurred on generating bulk orders : ${(error as ErrorHandler).message}`);
        throw new Error(`An error occurred on generating bulk orders : ${(error as ErrorHandler).message}`);
    } finally {
        logger.info(`Generating bulk orders ended with : ${batchSize} batch size on ${maxOrders} max orders`);
    }
}

const generateOrdersForUser = (premiums : PickServicePricing<SelectPremiumTable>[], 
stars : PickServicePricing<SelectStarTable>[], user : Pick<SelectUserTable, 'username' | 'id'>, maxOrders : number
) : InsertOrderTable[] => {
    const ordersList : Set<InsertOrderTable> = new Set();
    const orderCount : number = faker.number.int({ min : 1, max : maxOrders });
    
    for (let i : number = 0; i < orderCount; i++) {
        const basicProductData : RandomProduct = getRandomProduct(premiums, stars);

        ordersList.add({
            ...basicProductData,
            paymentMethod : faker.helpers.arrayElement(['IRR', 'TON']), userId : user.id, username : user.username, 
            transactionId : faker.number.int({ min : 100000, max : 999999 }),
            status : faker.helpers.arrayElement(['completed', 'pending', 'in_progress'])
        });
    }
    return Array.from(ordersList.values());
}

const getRandomProduct = (premiums : PickServicePricing<SelectPremiumTable>[], stars : PickServicePricing<SelectStarTable>[],
    premiumProbability : number = 0.6
) => {
    const isPremium : boolean = Math.random() < premiumProbability;
    const selectedOrder = isPremium ? faker.helpers.arrayElement(premiums) : faker.helpers.arrayElement(stars);

    return {
        premiumId : isPremium ? selectedOrder.id : null,
        starId : !isPremium ? selectedOrder.id : null,
        irrPrice : selectedOrder.irrPrice,
        tonQuantity : selectedOrder.tonQuantity,
    }
}

type RandomProduct = ReturnType<typeof getRandomProduct>;

await generateBulkOrders(batchSize);