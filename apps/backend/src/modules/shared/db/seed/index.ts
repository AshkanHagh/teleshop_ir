import { premiumTable, starTable, type InsertPremium, type InsertStar } from "@shared/models/services.model";
import { db } from "../drizzle";
import { faker } from "@faker-js/faker";
import type { InsertUser } from "@shared/models/user.model";
import RedisQuery from "@shared/db/redis/query";
import RedisKeys from "@shared/utils/keys";
import { logger } from "@shared/libs/winston";

const premiumsData: InsertPremium[] = [
    {
        duration: "سه ماهه", 
        ton: 10, 
        icon: "3-month", 
        features: ["تجربه بدون آگهی", "آپلود فایل‌ با حجم بیشتر", "افزایش سرعت دانلود"], 
        irr: 490000
    },
    {
        duration: "شش ماهه",
        ton: 20, 
        icon: "6-month", 
        features: ["همه ویژگی های 1 ماهه", "استیکر ها پرمیوم", "تبدیل صدا به متن"], 
        irr: 490000,
    },
    {
        duration: "یک ساله", 
        ton: 30, 
        icon: "1-year",
        features: ["تمام ویژگی های 6 ماهه", "پشتیبانی اولویت دار", "دسترسی زودهنگام به ویژگی های جدید"], 
        irr: 490000
    }
];

const services = [
    {
        title: "اکانت پرمیوم تلگرام",
        description: "ارتقای سریع و مطمئن اکانت تلگرام خود به نسخه پرمیوم.",
        route: "premium"
    },
    {
        title: "خرید استارس تلگرام",
        description: "خرید آسان و سریع ستاره‌های تلگرام برای افزایش تعامل و محبوبیت در کانال‌ها و گروه‌ها.",
        route: "stars"
    }
];
export const starsData = [
    50, 
    65,
    75, 
    100, 
    150, 
    250, 
    350, 
    500, 
    750, 
    1000, 
    1500, 
    2500, 
    5000, 
    10000, 
    25000, 
    35000, 
    50000
];

const generateUser = (userCount: number): InsertUser[] => {
    return Array.from({length: userCount}).map((_, index) => <InsertUser>{
        fullname: faker.person.fullName(),
        telegramId: faker.number.int({ min: 1000000000, max: 2000000000 }),
        username: faker.internet.username(),
    })
}

const insertServices = async () => {
    logger.info("inserting services");
    await RedisQuery.jsonSet(RedisKeys.services(), "$", JSON.stringify(services));
    logger.info("inserting completed");
}

const insertStarsAndPremiums = async () => {
    logger.info("inserting stars and premiums");
    const starDetail: Map<number, InsertStar> = new Map<number, InsertStar>();
    
    for (let i: number = 0; i < starsData.length; i++) {
        starDetail.set(i, {
            ton: 10, 
            stars: starsData[i],
            irr: 490000
        });
    }
    
    const [stars, premiums] = await Promise.all([
        await db.insert(starTable).values(Array.from(starDetail.values())).returning(),
        await db.insert(premiumTable).values(premiumsData).returning()
    ]);
    
    logger.info("inserting completed");
    return { stars, premiums };
}

const startSeeding = async () => {
    await Promise.all([
        insertServices(),
        insertStarsAndPremiums()
    ])

    process.exit(0);
}

await startSeeding();