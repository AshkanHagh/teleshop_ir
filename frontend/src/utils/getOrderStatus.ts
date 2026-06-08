import { CheckCircle, Clock } from "lucide-react"
import { IconType, OrderStatus } from "../types/types"

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
  pendingText: "در انتظار",
  inProgressText: "در حال انجام",
  completedText: "تکمیل شد",
  pendingIcon: Clock,
  inProgressIcon: Clock,
  completedIcon: CheckCircle
}

const createStatusItem = (
  text: string = "",
  icon: IconType = null,
  color: string = "",
  bgColor: string = ""
): StatusConfigItem => ({
  text,
  icon,
  color,
  bgColor
})

const getOrderStatus = (
  status: OrderStatus | null,
  customOptions: Partial<GetOrderStatusOptions> = {}
) => {
  const {
    pendingText,
    inProgressText,
    completedText,
    pendingIcon,
    inProgressIcon,
    completedIcon
  } = { ...defaultOptions, ...customOptions }

  const statusConfig: Record<OrderStatus, StatusConfigItem> = {
    pending: createStatusItem(
      pendingText,
      pendingIcon,
      "text-yellow-500",
      "bg-yellow-100"
    ),
    in_progress: createStatusItem(
      inProgressText,
      inProgressIcon,
      "text-blue-500",
      "bg-blue-100"
    ),
    completed: createStatusItem(
      completedText,
      completedIcon,
      "text-green-500",
      "bg-green-100"
    )
  }

  if (!status) return createStatusItem()

  return statusConfig[status]
}

export default getOrderStatus
