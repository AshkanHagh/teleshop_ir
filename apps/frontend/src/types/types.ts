export type GetIconVariants = '3-month' | '6-month' | '1-year'

export interface PremiumOption {
  id: string
  duration: string
  features: string[]
  irrPrice: number
  tonQuantity: number
  icon: GetIconVariants,
  updatedAt: string,
  createdAt: string
}

export type OrderStatus = 'pending' | 'in_progress' | 'completed'

export type PaymentMethod = 'rial' | 'ton'

export type UserFormData = {
  username: string | undefined
  paymentMethod: PaymentMethod
}

export type ManageOrder = {
  id: string
  username: string
  service: string
  status: OrderStatus
  orderPlaced: string
}

type ServiceType = {
  serviceName: 'stars' | 'premium'
}

export type OrderDetails = {
  id: string
  username: string
  service: ServiceType
  tonPrice: number
  rialPrice: number
  paymentDate: string
  status: OrderStatus
  starsCount?: number
}

export type User = {
  username: string;
  createdAt: string;
  id: string;
  lastName: string;
  roles: string[];
  telegramId: number;
  updatedAt: string;
}

export type UserValidation = {
  success: boolean;
  user: User;
  accessToken: string;
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
}

export type OrderServiceName = 'star' | 'premium'

export type Roles = 'admin' | 'customer'

type OrderHistoryPremiumService = {
  serviceName: 'premium',
  duration: number
}
type OrderHistoryStarService = {
  serviceName: 'star',
  stars: number
}

type OrderHistoryService = OrderHistoryPremiumService | OrderHistoryStarService

export type OrderHistory = {
  id: string
  service: OrderHistoryService
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

export type OrderFilterValues = OrderStatus | 'all'

export type OrderFilter = {
  value: OrderFilterValues
  label: string
}

export type HandleSelectChange = (newOption: SelectOption, stopChangeOption: () => 'stop') => void | 'stop'