import { PremiumOption } from '../../types/types'
import TGPremiumCard from './TGPremiumCard'
import Container from '../../components/layout/Container'
import useGetServiceOptions from '../../hook/useGetServiceOptions'
import TryAgainModal from '../../components/ui/TryAgainModal'
import { AnimatePresence } from 'framer-motion'
import SkeletonAnimationWrapper from '../../components/animation/SkeletonAnimationWrapper'
import ContentAnimationWrapper from '../../components/animation/ContentAnimationWrapper'
import TGPremiumCardSkeleton from './TGPremiumCardSkeleton'

type ResponseType = {
  success: boolean,
  service: PremiumOption[]
}

const Options = () => {

  const [refetch, { data: response, error, isLoading }] = useGetServiceOptions<ResponseType>('premium')

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

    if (response?.data.success && response.data) {
      return (
        <ContentAnimationWrapper key='content' className='space-y-5'>
          {response.data.service.map(option => (
            <TGPremiumCard key={option.id} option={option} />
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
export default Options