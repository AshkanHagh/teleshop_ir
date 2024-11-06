import { faker } from '@faker-js/faker';
import { db } from '@shared/db';
import { userTable } from '@shared/db/schemas/user.model';
import producer from '@shared/libs/producer';
import { logger } from '@shared/libs/winston';
import type { InsertUser, KafkaGlobalTopics, SelectUserTable } from '@shared/types';
import type ErrorHandler from '@shared/utils/errorHandler';
import { parentPort, workerData } from 'worker_threads';

const { end, start, topic } = workerData as { topic : KafkaGlobalTopics, start : number, end : number };
const generateRandomUser = async (start : number, end : number) => {
    try {
        const usersData : InsertUser[] = [];
        for (let i = start; i < end; i++) {
            const user = {
                lastName : faker.person.lastName(faker.helpers.arrayElement(['female', 'male'])),
                telegramId : faker.number.int({ min : 1000000000, max : 2000000000 }),
                username : `${faker.person.firstName(faker.helpers.arrayElement(['female', 'male']))}__${i}`
            }
            usersData.push(user);
        }
        const users : SelectUserTable[] = await db.insert(userTable).values(usersData).returning();
        
        const randomPartition : number = faker.number.int({min : 0, max : 2});
        await producer.produceMessage(topic, {value : users, headers : { retrycount : '5' }}, randomPartition);
        parentPort?.postMessage('done');
        
    } catch (error : unknown) {
        logger.error(`An error occurred from random user worker : ${(error as ErrorHandler).message}`);
        parentPort?.postMessage('error');
    }
}

await generateRandomUser(start, end).catch(error => logger.error((error as ErrorHandler).message));