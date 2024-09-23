import { AnimatePresence } from 'framer-motion'
import ContentAnimationWrapper from '../../components/animation/ContentAnimationWrapper'
import SkeletonAnimationWrapper from '../../components/animation/SkeletonAnimationWrapper'
import Container from '../../components/layout/Container'
import TryAgainModal from '../../components/ui/TryAgainModal'
import useGetOrdersHistory from '../../hook/useGetOrdersHistory'
import OrderItem from './OrderHistoryItem'
import OrderHistoryItemSkeleton from './OrderHistoryItemSkeleton'
import NoOrders from '../../components/ui/NoOrder'

const OrderHistoryPage = () => {
    const [refetch, { data: response, error, isLoading }] = useGetOrdersHistory()

    const renderContent = () => {
        if (isLoading) {
            return <SkeletonAnimationWrapper key='Skeleton'>
                {[...Array(3)].map((_, index) => <OrderHistoryItemSkeleton key={index} />)}
            </SkeletonAnimationWrapper>
        }

        if (error) {
            const errorMessage = error.response?.data.message
            return <TryAgainModal message={errorMessage} onRetry={refetch} />
        }

        if (response!.data.length < 1) {
            return <ContentAnimationWrapper key='no-order'>
                <NoOrders />
            </ContentAnimationWrapper>
        }

        if (response?.success && response.data) {
            return <ContentAnimationWrapper key='ContentWrapper' duration={0.3}>
                {response?.data.map(order => (
                    <OrderItem
                        key={order.id}
                        id={order.id}
                        serviceName={order.serviceName}
                        orderDate={order.orderDate}
                        status={order.status}
                    />
                ))}
            </ContentAnimationWrapper>
        }
    }

    return (
        <Container title='سفارش های من'>
            <AnimatePresence mode='wait'>
                {renderContent()}
            </AnimatePresence>
        </Container>
    )
}

export default OrderHistoryPage