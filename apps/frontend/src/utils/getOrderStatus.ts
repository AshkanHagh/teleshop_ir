import { CheckCircle, Clock, LucideProps } from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes } from "react"
import { OrderStatus } from "../types/types"

type IconType = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>

type StatusConfigItem = {
    icon: IconType
    color: string
    bgColor: string
    text: string
}

type GetOrderStatusOptions = {
    pendingText: string
    inProgressText: string
    completedText: string
    pendingIcon: IconType
    inProgressIcon: IconType
    completedIcon: IconType
}

const defaultOptions: GetOrderStatusOptions = {
    pendingText: 'در انتظار',
    inProgressText: 'در حال انجام',
    completedText: 'تکمیل شد',
    pendingIcon: Clock,
    inProgressIcon: Clock,
    completedIcon: CheckCircle
}

// تابع کمکی برای ساختن وضعیت‌ها
const createStatusItem = (text: string, icon: IconType, color: string, bgColor: string): StatusConfigItem => ({
    text,
    icon,
    color,
    bgColor
})

const getOrderStatus = (status: OrderStatus, customOptions: Partial<GetOrderStatusOptions> = {}) => {
    const {
        pendingText,
        inProgressText,
        completedText,
        pendingIcon,
        inProgressIcon,
        completedIcon
    } = { ...defaultOptions, ...customOptions }

    const statusConfig: Record<OrderStatus, StatusConfigItem> = {
        pending: createStatusItem(pendingText, pendingIcon, 'text-yellow-500', 'bg-yellow-100'),
        in_progress: createStatusItem(inProgressText, inProgressIcon, 'text-blue-500', 'bg-blue-100'),
        completed: createStatusItem(completedText, completedIcon, 'text-green-500', 'bg-green-100')
    }

    return statusConfig[status]
}

export default getOrderStatus
