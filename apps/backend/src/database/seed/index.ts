import { db } from '..';
import redis from '../../libs/redis.config';
import { premiumTable, starTable, type DrizzleInsertPremium, type DrizzleInsertStar, type DrizzleSelectStar, 
    type StarQuantity 
} from '../../models/service.model';
import type { ServicesSchema } from '../../schemas/zod.schema';
import { premiumKey, servicesKey, starKey } from '../../utils/keys';

const quarterlyDetail = <DrizzleInsertPremium>{
    duration : 'سه ماهه', 
    ton_quantity : '0', 
    icon : '3-month', 
    features : ['تجربه بدون آگهی', 'آپلود فایل‌ با حجم بیشتر', 'افزایش سرعت دانلود'], 
    irr_price : '0'
}

const semi_annuallyDetail = <DrizzleInsertPremium>{
    duration : 'شش ماهه',
    ton_quantity : '0',
    icon : '6-month', 
    features : ['همه ویژگی های 1 ماهه', 'استیکر ها پرمیوم', 'تبدیل صدا به متن'], 
    irr_price : '0'
}

const annuallyDetail = <DrizzleInsertPremium>{
    duration : 'یک ساله', 
    ton_quantity : '0', 
    icon : '1-year',
    features : ['تمام ویژگی های 6 ماهه', 'پشتیبانی اولویت دار', 'دسترسی زودهنگام به ویژگی های جدید'], 
    irr_price : '0'
}

const services = <ServicesSchema>[
    {
        id : '4d69465a-fb00-4433-a5fe-15745644c7e4',
        title : 'اکانت پرمیوم تلگرام',
        description : 'ارتقای سریع و مطمئن اکانت تلگرام خود به نسخه پرمیوم.',
        route : 'premium'
    },
    {
        id : '71dd7606-b1a8-4f6b-89e6-7141f4465ccf',
        title : "خرید استارس تلگرام",
        description : "خرید آسان و سریع ستاره‌های تلگرام برای افزایش تعامل و محبوبیت در کانال‌ها و گروه‌ها.",
        route : 'stars'
    }
];
export const starQuantity = ['50', '75', '100', '150', '250', '350', '500', '750', '1000', '1500', '2500', '5000', 
    '10000', '25000', '35000', '50000'
]
const stellarDetail : Map<number, DrizzleInsertStar> = new Map<number, DrizzleInsertStar>();
for (let i : number = 0; i < starQuantity.length; i++) {
    stellarDetail.set(i, {
        irr_price : '0', 
        stars : starQuantity.sort((a, b) => +a - +b)[i] as StarQuantity,
        ton_quantity : '0'
    });
}
await db.transaction(async trx => {
    const stars : DrizzleSelectStar[] = await trx.insert(starTable).values(Array.from(stellarDetail.values())).returning();
    const premiums = await trx.insert(premiumTable).values([quarterlyDetail, semi_annuallyDetail, annuallyDetail]).returning();
    const pipeline = redis.pipeline();
    await pipeline.json.set(servicesKey(), '$', services).json.set(premiumKey(), '$', premiums).json.set(starKey(), '$', stars).exec()
});