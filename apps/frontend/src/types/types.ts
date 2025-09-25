import { LucideProps } from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes } from "react"

export type PremiumIconVariants = "3-month" | "6-month" | "1-year"

export interface PremiumOption {
  id: string
  duration: string
  features: string[]
  irr: number
  ton: number
  icon: PremiumIconVariants
  updatedAt: string
  createdAt: string
}

export type OrderStatus = "pending" | "in_progress" | "completed"

export type PaymentMethod = "irr" | "ton"

type OrderPremiumService = {
  serviceName: "premium"
  duration: number
}
type OrderStarService = {
  serviceName: "star"
  stars: number
}

export type UserFormData = {
  username: string
  paymentMethod: PaymentMethod
}

export type ManageOrder = {
  id: string
  username: string
  serviceName: OrderServiceName
  status: OrderStatus
  orderPlaced: string
}

type OrderDetailsService = {
  irr: number
  ton: number
} & (OrderStarService | OrderPremiumService)

export type OrderDetails = {
  id: string
  status: OrderStatus
  orderPlaced: string
  username: string
  service: OrderDetailsService
  transactionId: number
}

export type User = {
  username: string
  createdAt: string
  id: string
  lastName: string
  roles: string[]
  telegramId: number
  updatedAt: string
}

export type UserValidation = {
  success: boolean
  user: User
  accessToken: string
}

export type RefreshResponse = {
  success: boolean
  accessToken: string
}

export type ResponseError = {
  success: boolean
  message: string
}

export type Service = {
  id: string
  title: string
  description: string
  route: string
  icon: IconType
}
export type Roles = "admin" | "customer"

export type OrderServiceName = "star" | "premium"

export type OrderHistory = {
  id: string
  serviceName: OrderServiceName
  orderPlaced: string
  status: OrderStatus
}

type OrderDataKey<T, K extends string> = {
  [key in K]: T
}
export type OrderResponseType<T, K extends string> = {
  success: boolean
  next: boolean
} & OrderDataKey<T, K>

export type SelectOption = {
  value: string
  label: string
  isInitValue?: boolean
}

export type OrderFilterValues = OrderStatus | "all"

export type OrderFilter = {
  value: OrderFilterValues
  label: string
}

export type HandleSelectChange = (
  newOption: SelectOption,
  stopChangeOption: () => "stop"
) => void | "stop"

export type IconType = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
> | null

export type Star = {
  id: string
  irr: number
  ton: number
  stars: number
  updatedAt: string
  createdAt: string
}

export type SocketPrice = {
  id: string
  totalTonAmount: number
  totalTonPriceInIrr: number
}

export type SocketData = {
  type: "updated-star-prices" | "updated-premium-prices"
  data: SocketPrice[]
}
