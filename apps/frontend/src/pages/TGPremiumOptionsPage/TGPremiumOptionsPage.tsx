import { PremiumOption } from '../../types/types'
import TGPremiumCard from './TGPremiumCard'
import OptionCardSkeleton from './TGPremiumCardSkeleton'
import Container from '../../components/layout/Container'

const premiumOptions: PremiumOption[] = [
  {
    id: '1',
    duration: '1 ماهه',
    features: ['تجربه بدون آگهی', 'آپلود فایل‌ با حجم بیشتر', 'افزایش سرعت دانلود'],
    priceTon: 5,
    priceRial: 1500000,
    icon: '1-month'
  },
  {
    id: '2',
    duration: '6 ماهه',
    features: ['همه ویژگی های 1 ماهه', 'استیکر ها پرمیوم', 'تبدیل صدا به متن'],
    priceTon: 25,
    priceRial: 7500000,
    icon: '6-month'
  },
  {
    id: '3',
    duration: '1 ساله',
    features: ['تمام ویژگی های 6 ماهه', 'پشتیبانی اولویت دار', 'دسترسی زودهنگام به ویژگی های جدید'],
    priceTon: 45,
    priceRial: 13500000,
    icon: '1-year'
  }
]

const Options = () => {
  return (
    <Container title='اکانت های پرمیوم'>
      {false
        ?
        // Premium Card Skeleton for loading
        [1, 2, 3].map(key => (
          <OptionCardSkeleton key={key} />
        ))
        :
        // Options Card
        <div className="grid grid-cols-1 gap-6">
          {premiumOptions.map((option, index) => (
            <TGPremiumCard key={index} option={option} />
          ))}
        </div>
      }
    </Container >
  )
}

export default Options
