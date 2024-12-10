import { PremiumOption, SocketData } from '../../types/types'
import TGPremiumCard from './PremiumCard'
import Container from '../../components/layout/Container'
import useGetServiceOptions from '../../hook/useGetServiceOptions'
import TryAgainModal from '../../components/ui/TryAgainModal'
import { AnimatePresence } from 'framer-motion'
import SkeletonAnimationWrapper from '../../components/animation/SkeletonAnimationWrapper'
import ContentAnimationWrapper from '../../components/animation/ContentAnimationWrapper'
import TGPremiumCardSkeleton from './PremiumCardSkeleton'
import useSocket from '../../hook/useSocket'
import { useCallback } from 'react'
import { toast } from 'sonner'

const PremiumPage = () => {
  const [refetch, { data, error, isLoading, setData }] = useGetServiceOptions<PremiumOption[]>('premium')

  const handleSocketError = useCallback(() => toast.error('خطا در بروزرسانی قیمت!'), [])

  const handleSocketMessage = useCallback((message: MessageEvent<string>) => {
    const socketData: SocketData = JSON.parse(message.data)
    if (socketData.type !== 'updated-premium-prices') return;

    const newPrices = Object.fromEntries(
      socketData.data.map(price => [
        price.id,
        {
          totalTonAmount: price.totalTonAmount,
          totalTonPriceInIrr: price.totalTonPriceInIrr,
        }
      ])
    );

    setData(prev => {
      if (!prev) return undefined
      const updatedService: PremiumOption[] = prev.service.map(premium => {
        const priceData = newPrices[premium.id]
        if (!priceData) return premium

        return {
          ...premium,
          irrPrice: priceData.totalTonPriceInIrr,
          tonQuantity: priceData.totalTonAmount,
        }
      })
      return { ...prev, service: updatedService }
    })
  }, [setData])

  useSocket(handleSocketMessage, handleSocketError)

  const SKELETON_COUNT = 3
  const renderContent = () => {
    if (isLoading) {
      return (
        <SkeletonAnimationWrapper key='skeleton'>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <TGPremiumCardSkeleton key={index} />
          ))}
        </SkeletonAnimationWrapper>
      )
    }

    if (error) {
      const errorMessage = error.response?.data.message
      return (
        <TryAgainModal onRetry={refetch} message={errorMessage} />
      )
    }

    if (data?.success) {
      return (
        <ContentAnimationWrapper key='content' className='flex flex-col gap-y-7'>
          {data.service.map(option => (
            <TGPremiumCard
              key={option.id}
              id={option.id}
              duration={option.duration}
              features={option.features}
              icon={option.icon}
              irr={option.irr}
              ton={option.ton}
            />
          ))}
        </ContentAnimationWrapper>
      )
    }
  }

  return (
    <Container title='اکانت های پرمیوم'>
      <AnimatePresence mode='wait'>
        {renderContent()}
      </AnimatePresence>
    </Container >
  )
}
export default PremiumPage