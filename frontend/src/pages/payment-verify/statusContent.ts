import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { IconType } from "../../types/types"

type Statuses = "loading" | "success" | "failure"

type StatusContent = {
  icon: IconType
  iconClass: string
  title: string
  description: string
  hasButton: boolean
  buttonClass?: string
}

export const statusContent: Record<Statuses, StatusContent> = {
  loading: {
    icon: Loader2,
    iconClass: "size-14 text-blue-500 animate-spin mx-auto",
    title: "در حال بررسی وضعیت پرداخت",
    description: "لطفاً صبر کنید...",
    hasButton: false
  },
  success: {
    icon: CheckCircle,
    iconClass: "size-14 text-green-500 mx-auto",
    title: "پرداخت موفق",
    description: "سفارش شما با موفقیت ثبت شد.",
    hasButton: true,
    buttonClass: "text-white bg-green-500"
  },
  failure: {
    icon: XCircle,
    iconClass: "size-14 text-red-500 mx-auto",
    title: "پرداخت ناموفق",
    description: "متأسفانه مشکلی در پرداخت شما رخ داده است.",
    hasButton: false
  }
}
