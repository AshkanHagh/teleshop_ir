import { db } from '../.';
import redis from '../../configs/redis.config';
import { premiumTable, starTable, starQuantityPricing, type InsertPremium, type InsertStar, type SelectStar, 
    type StarQuantity 
} from '../../models/service.model';
import type { LandingPage } from '../../services/services.service';

const quarterlyDetail = <InsertPremium>{
    duration : 'سه ماهه', 
    tonPrice : '2.22', 
    icon : '3-month', 
    features : ['تجربه بدون آگهی', 'آپلود فایل‌ با حجم بیشتر', 'افزایش سرعت دانلود'], 
    rialPrice : '0'
}

const semi_annuallyDetail = <InsertPremium>{
    duration : 'شش ماهه',
    tonPrice : '2.96', 
    icon : '6-month', 
    features : ['همه ویژگی های 1 ماهه', 'استیکر ها پرمیوم', 'تبدیل صدا به متن'], 
    rialPrice : '0'
}

const annuallyDetail = <InsertPremium>{
    duration : 'یک ساله', 
    tonPrice : '5.37', 
    icon : '1-year',
    features : ['تمام ویژگی های 6 ماهه', 'پشتیبانی اولویت دار', 'دسترسی زودهنگام به ویژگی های جدید'], 
    rialPrice : '0'
}

const stellarDetail : Map<number, InsertStar> = new Map<number, InsertStar>();
for (let i : number = 0; i < Object.keys(starQuantityPricing).length; i++) {
    stellarDetail.set(i, {
        rialPrice : '0', 
        stars : Object.keys(starQuantityPricing).sort((a, b) => +a - +b)[i] as StarQuantity,
        tonPrice : Object.values(starQuantityPricing).sort((a, b) => +a - +b)[i]
    });
}
const stars : SelectStar[] = await db.insert(starTable).values(Array.from(stellarDetail.values())).returning();

const premiums = await db.insert(premiumTable).values([quarterlyDetail, semi_annuallyDetail, annuallyDetail]).returning();
const pipeline = redis.pipeline();

const landingPage = <LandingPage[]>[
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

landingPage.forEach(landingPage => pipeline.sadd(`landing_page`, JSON.stringify(landingPage)));
premiums.forEach(premium => pipeline.sadd('premiums', JSON.stringify(premium)));
stars.forEach(star => pipeline.sadd('stars', JSON.stringify(star)));
pipeline.exec();