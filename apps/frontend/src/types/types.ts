export type GetIconVariants = '3-month' | '6-month' | '1-year'

export interface PremiumOption {
  id: string
  duration: string
  features: string[]
  irr_price: number
  ton_quantity: number
  icon: GetIconVariants
}

export type PaymentMethod = 'rial' | 'ton'

export type UserFormData = {
  username: string | undefined
  paymentMethod: PaymentMethod
}

export type ManageOrder = {
  id: string
  username: string
  serviceName: string
  status: 'In Progress' | 'Completed',
  createdAt: string
}

export type OrderDetails = {
  id: string
  username: string
  serviceName: 'Telegram Premium' | 'Telegram Stars'
  tonPrice: number
  rialPrice: number
  paymentDate: string
  status: 'In Progress' | 'Completed'
  starsCount?: number
}

export type User = {
  username: string;
  createdAt: string;
  id: string;
  lastName: string;
  role: string;
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

export type Roles = 'owner'