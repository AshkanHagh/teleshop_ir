import { useEffect, useState } from 'react'
import Container from '../../components/layout/Container'
import { ManageOrder } from '../../types/types'
import OrderItem from './ManageOrderItem'
import OrderItemSkeleton from './ManageOrderItemSkeleton'
import SkeletonAnimationWrapper from '../../components/animation/SkeletonAnimationWrapper'
import ServiceCardSkeleton from '../homePage/ServiceCardSkeleton'
import TryAgainModal from '../../components/ui/TryAgainModal'
import ContentAnimationWrapper from '../../components/animation/ContentAnimationWrapper'
import { AnimatePresence } from 'framer-motion'
import NoOrders from '../../components/ui/NoOrder'

const mockOrders: ManageOrder[] = [
]

const OrderListPage = () => {

    const [data, setData] = useState<ManageOrder[]>([])
    const [isLoading, setIsLoading] = useState<Boolean>(true)

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true)
            const response = await new Promise<ManageOrder[]>(resolve => setTimeout(() => resolve(mockOrders), 2000))
            setData(response)
            setIsLoading(false)
        }

        fetch()
    }, [])

    const SKELETON_COUNT = 2
    const renderContent = () => {
        if (isLoading) {
            return (
                <SkeletonAnimationWrapper key='skeleton'>
                    <ul className="space-y-4">
                        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                            <ServiceCardSkeleton key={`skeleton-${index}`} />
                        ))}
                    </ul>
                </SkeletonAnimationWrapper>
            )
        }

        // if (error) {
        //     return (
        //         <TryAgainModal onRetry={refetch} message={error.message} />
        //     )

        if (data.length < 1) return <ContentAnimationWrapper key='no-order'><NoOrders /></ContentAnimationWrapper>
        if (data) {
            return (
                <ContentAnimationWrapper key='content'>
                    <ul className="space-y-4">
                        {data.map(card => (
                            <OrderItem key={card.id} order={card} />
                        ))}
                    </ul>
                </ContentAnimationWrapper>
            )
        }
        return null
    }

    return (
        <Container title='سفارشات'>
            <AnimatePresence mode='wait'>
                {renderContent()}
            </AnimatePresence>
        </Container>
    )
}



export default OrderListPage