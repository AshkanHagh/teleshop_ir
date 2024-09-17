import { CheckCircle, Clock, LucideProps } from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes } from "react"

type OrderStatus = 'Pending' | 'In Progress' | 'Completed'

type StatusConfigItem = {
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
    color: string
    bgColor: string
    text: string
}

const statusConfig: Record<OrderStatus, StatusConfigItem> = {
    'Pending': { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-100', text: 'در انتظار' },
    'In Progress': { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-100', text: 'در حال انجام' },
    'Completed': { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100', text: 'تکمیل شد' },
}

const getOrderStatus = (status: OrderStatus) => {
    return statusConfig[status]
}

export default getOrderStatus