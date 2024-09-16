export type GetIconVariants = '1-month' | '6-month' | '1-year'

export interface PremiumOption {
  id: string
  duration: string
  features: string[]
  priceTon: number
  priceRial: number
  icon: GetIconVariants
}

export type PaymentMethod = 'rial' | 'ton'

export type UserFormData = {
  username: string
  paymentMethod: PaymentMethod
}

export type Order = {
  id: string
  username: string
  serviceName: string
  status: 'In Progress' | 'Completed'
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

export type UserDetail = {
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
  userDetail: UserDetail;
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