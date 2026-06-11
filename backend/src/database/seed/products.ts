import { Pool } from "pg";
import {
  CategoryTable,
  PremiumPlanForm,
  PremiumPlanTable,
  StarPackageForm,
  StarPackageTable,
} from "../schemas/index.js";
import { drizzle } from "drizzle-orm/node-postgres";

const premiumsData: PremiumPlanForm[] = [
  {
    duration: "سه ماهه",
    ton: 10,
    icon: "3-month",
    features: [
      "تجربه بدون آگهی",
      "آپلود فایل‌ با حجم بیشتر",
      "افزایش سرعت دانلود",
    ],
    irr: 490000,
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
    features: [
      "تمام ویژگی های 6 ماهه",
      "پشتیبانی اولویت دار",
      "دسترسی زودهنگام به ویژگی های جدید",
    ],
    irr: 490000,
  },
];

const categories = [
  {
    title: "اکانت پرمیوم تلگرام",
    description: "ارتقای سریع و مطمئن اکانت تلگرام خود به نسخه پرمیوم.",
    route: "premium",
  },
  {
    title: "خرید استارس تلگرام",
    description:
      "خرید آسان و سریع ستاره‌های تلگرام برای افزایش تعامل و محبوبیت در کانال‌ها و گروه‌ها.",
    route: "stars",
  },
];
export const starsCount = [
  50, 65, 75, 100, 150, 250, 350, 500, 750, 1000, 1500, 2500, 5000, 10000,
  25000, 35000, 50000,
];

const main = async () => {
  try {
    console.log("product plans seed operation started");

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      ssl: process.env.NODE_ENV === "production",
    });
    const db = drizzle(pool, { casing: "snake_case" });

    const starPackages = new Map<number, StarPackageForm>();

    for (let i: number = 0; i < starsCount.length; i++) {
      starPackages.set(i, {
        ton: 10,
        stars: starsCount[i],
        irr: 490000,
      });
    }
    await Promise.all([
      db.insert(CategoryTable).values(categories),
      db.insert(StarPackageTable).values(Array.from(starPackages.values())),
      db.insert(PremiumPlanTable).values(premiumsData),
    ]);
  } catch (error) {
    console.log(error);
  }

  process.exit(0);
};
main();
