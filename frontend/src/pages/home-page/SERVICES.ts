import { Crown, Star } from "lucide-react"
import { Service } from "../../types/types"

export const SERVICES: Service[] = [
  {
    id: "1",
    route: "premium",
    title: "اکانت پرمیوم تلگرام",
    description: "ارتقای سریع و مطمئن اکانت تلگرام خود به نسخه پرمیوم.",
    icon: Crown
  },
  {
    id: "2",
    route: "stars",
    title: "خرید استارس تلگرام",
    description:
      "خرید آسان و سریع ستاره‌های تلگرام برای افزایش تعامل و محبوبیت در کانال‌ها و گروه‌ها.",
    icon: Star
  }
]
