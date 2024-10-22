import { db } from '..';
import redis from '../../libs/redis.config';
import ErrorHandler from '../../utils/errorHandler';
import { userTable } from '../schema/user.model';
import { orderIndexKey, orderKeyById, premiumKey, servicesKey, starKey, userOrderKeyById, usersKeyById } from '../../utils/keys';
import { faker } from '@faker-js/faker';
import type { InsertOrder, InsertPremium, InsertStar, InsertUser, SelectOrder, SelectPremium, SelectStar, SelectUser, 
    StarQuantity 
} from '../../types';
import { eq } from 'drizzle-orm';
import { premiumTable, starTable } from '../schema/services.model';
import { orderTable } from '../schema/order.model';
import type { ChainableCommander } from 'ioredis';
import RedisMethod from '../cache';

const premiumServices : InsertPremium[] = [
    {
        duration : 'سه ماهه', 
        tonQuantity : 100, 
        icon : '3-month', 
        features : ['تجربه بدون آگهی', 'آپلود فایل‌ با حجم بیشتر', 'افزایش سرعت دانلود'], 
        irrPrice : 100
    },
    {
        duration : 'شش ماهه',
        tonQuantity : 100, 
        icon : '6-month', 
        features : ['همه ویژگی های 1 ماهه', 'استیکر ها پرمیوم', 'تبدیل صدا به متن'], 
        irrPrice : 100
    },
    {
        duration : 'یک ساله', 
        tonQuantity : 100, 
        icon : '1-year',
        features : ['تمام ویژگی های 6 ماهه', 'پشتیبانی اولویت دار', 'دسترسی زودهنگام به ویژگی های جدید'], 
        irrPrice : 100
    }
];

const services = [
    {
        id : crypto.randomUUID(),
        title : 'اکانت پرمیوم تلگرام',
        description : 'ارتقای سریع و مطمئن اکانت تلگرام خود به نسخه پرمیوم.',
        route : 'premium'
    },
    {
        id : crypto.randomUUID(),
        title : 'خرید استارس تلگرام',
        description : 'خرید آسان و سریع ستاره‌های تلگرام برای افزایش تعامل و محبوبیت در کانال‌ها و گروه‌ها.',
        route : 'stars'
    }
];
export const starQuantity = ['50', '75', '100', '150', '250', '350', '500', '750', '1000', '1500', '2500', '5000', 
    '10000', '25000', '35000', '50000'
];

const generateRandomUser = (userCount : number) : InsertUser[] => {
    return Array.from({length : userCount}).map((_, index) => <InsertUser>{
        lastName : faker.person.lastName(),
        telegramId : faker.number.int({ min : 1000000000, max : 2000000000 }),
        username : `${faker.person.fullName()}+${index}`,
    })
}

async function servicesSeed() {
    try {
        await db.transaction(async trx => {
            await Promise.all([trx.delete(userTable), trx.delete(premiumTable), trx.delete(starTable), trx.delete(orderTable), 
                redis.flushall()
            ]);
            console.log('Seeding started');
            const pipeline : ChainableCommander = redis.pipeline();
            const starDetail : Map<number, InsertStar> = new Map<number, InsertStar>();
            for (let i : number = 0; i < starQuantity.length; i++) {
                starDetail.set(i, {
                    irrPrice : 100, 
                    stars : starQuantity.sort((a, b) => +a - +b)[i] as StarQuantity,
                    tonQuantity : 100
                });
            }
    
            const stars : SelectStar[] = await trx.insert(starTable).values(Array.from(starDetail.values())).returning();
            const premiums : SelectPremium[] = await trx.insert(premiumTable).values(premiumServices).returning();
            RedisMethod.pipelineJsonset(pipeline, premiumKey(), '$', premiums, null);
            RedisMethod.pipelineJsonset(pipeline, starKey(), '$', stars, null);
            console.log('Stars and Premium seeding completed');

            const randomUsersData = generateRandomUser(5);
            console.log('Users Data created');
            const users : SelectUser[] = await trx.insert(userTable).values(randomUsersData).returning();
            console.log('Users seeding completed');
            
            const orderDetail : InsertOrder[] = users.flatMap(user => {
                RedisMethod.pipelineJsonset(pipeline, usersKeyById(user.id), '$', user, 2 * 24 * 60 * 60);
                const ordersMap : Map<number, InsertOrder> = new Map();
                const orderCount = faker.number.int({ min : 0, max : 7 });
                
                for (let i : number = 0; i < orderCount; i++) {
                    const premiumId = faker.helpers.arrayElement(premiums.map(premium => faker.helpers.arrayElement([premium.id, null])));
                    let starId : string | null = null;
                    if (Math.random() < 0.5 && !premiumId || !premiumId) starId = faker.helpers.arrayElement(stars.map(star => star.id));
                    const orderPrice = starId ? stars.find(star => star.id === starId) : premiums.find(premium => premium.id === premiumId);
    
                    ordersMap.set(i, {
                        paymentMethod : faker.helpers.arrayElement(['IRR', 'TON']), userId : user.id,
                        username : user.username, premiumId, starId, irrPrice : orderPrice!.irrPrice, tonQuantity : orderPrice!.tonQuantity,
                        transactionId : faker.number.int({ min : 100000, max : 999999 }),
                        status : faker.helpers.arrayElement(['completed', 'pending', 'in_progress'])
                    });
                }
                return Array.from(ordersMap.values());
            });
            console.log('Order Data created');
            const orders = await trx.insert(orderTable).values(orderDetail).returning();
            console.log('Order seeding completed')
    
            const orderHistoryMap = new Map();
            const orderExistsMap = new Map();
            for (const order of orders) {
                const orderCache = orderHistoryMap.get(order.userId);
                if(!orderCache) {
                    orderHistoryMap.set(order.userId, 'done');
                    console.log(`Creating history index key for order : ${order.id}`);
                    await RedisMethod.jsonset(userOrderKeyById(order.userId), '$', [order], null);
                }else {
                    RedisMethod.pipelineJsonArrappend(pipeline, userOrderKeyById(order.userId), '$', order, null);
                }
                const orderIndex = orderExistsMap.get(orderKeyById(''));
                if(!orderIndex) {
                    orderExistsMap.set(orderKeyById(''), 'done');
                    console.log(`Creating order index key for order : ${order.id}`);
                    await RedisMethod.jsonset(orderIndexKey(), '$', [{id : order.id, status : order.status, 
                        orderPlaced : order.orderPlaced
                    }], null);
                }else {
                    RedisMethod.pipelineJsonArrappend(pipeline, orderIndexKey(), '$', {id : order.id, status : order.status,
                        orderPlaced : order.orderPlaced
                    }, null);
                }
                RedisMethod.pipelineJsonset(pipeline, orderKeyById(order.id), '$', order, null)
            }
            RedisMethod.pipelineJsonset(pipeline, servicesKey(), '$', services, null)
            await pipeline.exec();
            await RedisMethod.redisIndex('orderIdx', orderKeyById(''), ['$.id', 'AS', 'id', 'TAG', '$.status', 'AS', 'status', 'TAG']);
            console.log(`Seeding completed`);
        })
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        console.log(error.message);
        process.exit(1);
    }
}

const seedTestingAdmin = async () => {
    try {
        await db.transaction(async trx => {
            console.log('Seeding for testing admin started');
            const userDetail : InsertUser = {
                'telegramId': 1043807305,
                'lastName': '',
                'username': 'Shahinfallah2006',
                'roles': [
                    'admin'
                ],
            }
            const pipeline : ChainableCommander = redis.pipeline();
            const [user] : SelectUser[] = await trx.insert(userTable).values(userDetail).returning();
            RedisMethod.pipelineJsonset(pipeline, usersKeyById(user.id), '$', user, null);
        
            const premiums : SelectPremium[] = await trx.select().from(premiumTable);
            const stars : SelectStar[] = await trx.select().from(starTable);
        
            const ordersMap : Map<number, InsertOrder> = new Map();
            const orderCount = faker.number.int({ min : 0, max : 20 });
            for (let i : number = 0; i < orderCount; i++) {
                const premiumId = faker.helpers.arrayElement(premiums.map(premium => faker.helpers.arrayElement([premium.id, null])));
                let starId : string | null = null;
                if (Math.random() < 0.5 && !premiumId || !premiumId) starId = faker.helpers.arrayElement(stars.map(star => star.id));
                const orderPrice = starId ? stars.find(star => star.id === starId) : premiums.find(premium => premium.id === premiumId);
        
                ordersMap.set(i, {
                    paymentMethod : faker.helpers.arrayElement(['IRR', 'TON']), userId : user.id,
                    username : user.username, premiumId, starId, irrPrice : orderPrice!.irrPrice, tonQuantity : orderPrice!.tonQuantity,
                    transactionId : faker.number.int({ min : 100000, max : 999999 }),
                    status : faker.helpers.arrayElement(['completed', 'pending', 'in_progress'])
                });
            }
            const orders : SelectOrder[] = await trx.insert(orderTable).values(Array.from(ordersMap.values())).returning();
            const orderHistoryMap = new Map();
            for (const order of orders) {
                const orderCache = orderHistoryMap.get(order.userId);
                if(!orderCache) {
                    orderHistoryMap.set(order.userId, 'done');
                    await RedisMethod.jsonset(userOrderKeyById(order.userId), '$', [order], null);
                }else {
                    RedisMethod.pipelineJsonArrappend(pipeline, userOrderKeyById(order.userId), '$', order, null);
                }
                RedisMethod.pipelineJsonArrappend(pipeline, orderIndexKey(), '$', {id : order.id, status : order.status,
                    orderPlaced : order.orderPlaced
                }, null);
                RedisMethod.pipelineJsonset(pipeline, orderKeyById(order.id), '$', order, null)
            }
            await pipeline.exec();
            console.log('Seeding for testing admin ended');
        })
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        console.log(error.message);
        process.exit(1);
    }
}

const customOrderStatus = async (status : SelectOrder['status']) => {
    try {
        console.log('Starting seeding order with custom status');
        const pipeline : ChainableCommander = redis.pipeline();
        const premiums : SelectPremium[] = await db.select().from(premiumTable);
        const stars : SelectStar[] = await db.select().from(starTable);
        const testingAdmin : SelectUser[] = await db.select().from(userTable).where(eq(userTable.telegramId, 1043807305));
    
        const orderDetail : InsertOrder[] = Array.from({length : 10}).map(() => {
            const premiumId = faker.helpers.arrayElement(premiums.map(premium => faker.helpers.arrayElement([premium.id, null])));
            let starId : string | null = null;
            if (Math.random() < 0.5 && !premiumId || !premiumId) starId = faker.helpers.arrayElement(stars.map(star => star.id));
            const orderPrice = starId ? stars.find(star => star.id === starId) : premiums.find(premium => premium.id === premiumId);
            return {
                premiumId, starId, irrPrice : orderPrice!.irrPrice, tonQuantity : orderPrice!.tonQuantity,
                paymentMethod : faker.helpers.arrayElement(['IRR', 'TON']), userId : testingAdmin[0].id,
                transactionId : faker.number.int({ min : 100000, max : 999999 }), username : 'Big daddy ashkan', status
            }
        });
        const orders : SelectOrder[] = await db.insert(orderTable).values(Array.from(orderDetail.values())).returning();
        for (const order of orders) {
            RedisMethod.pipelineJsonArrappend(pipeline, orderIndexKey(), '$', {id : order.id, status : order.status,
                orderPlaced : order.orderPlaced
            }, null);
            RedisMethod.pipelineJsonset(pipeline, orderKeyById(order.id), '$', order, null);
            RedisMethod.pipelineJsonArrappend(pipeline, userOrderKeyById(testingAdmin[0].id), '$', order, null);
        }
        await pipeline.exec();
        console.log('Order with custom status seeding completed');
        
    } catch (err : unknown) {
        const error : ErrorHandler = err as ErrorHandler;
        console.log(error.message);
        process.exit(1);
    }
}

await servicesSeed();
await seedTestingAdmin();
await customOrderStatus('in_progress');
process.exit(0);