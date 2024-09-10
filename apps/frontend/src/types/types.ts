export type GetIconVariants = '1-month' | '6-month' | '1-year'

export interface PremiumOption {
  id: string
  duration: string
  features: string[]
  priceTon: number
  priceRial: number
  icon: GetIconVariants
}

export type OptionsParams = {
  serviceId: string
}