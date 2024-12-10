import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Container from '../../components/layout/Container'
import OrderDetailsSkeleton from './ManageOrderDetailsSkeleton'
import ManageOrderDetailsField from './ManageOrderDetailsField'
import Button from '../../components/ui/Button'
import getOrderStatus from '../../utils/getOrderStatus'
import useGetOrderDetails from '../../hook/useGetOrderDetails'
import TryAgainModal from '../../components/ui/TryAgainModal'
import { AnimatePresence } from 'framer-motion'
import SkeletonAnimationWrapper from '../../components/animation/SkeletonAnimationWrapper'
import ContentAnimationWrapper from '../../components/animation/ContentAnimationWrapper'
import { useMemo } from 'react'
import formatOrderTime from '../../utils/formatOrderTime'
import useCompleteOrder from '../../hook/useCompleteOrder'

const ManageOrderDetailsPage: React.FC = () => {
  const { orderId } = useParams()
  const [completeOrder, { completedError, isCompleting }] = useCompleteOrder()
  const [refetch, { data: order, error, isLoading, setData: setOrder }] = useGetOrderDetails(`/dashboard/admin`, orderId)

  const orderFields = useMemo(() =>
    Object.entries({
      'شماره سفارش': order?.transactionId,
      'نام کاربری': order?.username,
      'نام سرویس': order?.service.serviceName,
      'قیمت(TON)': order?.service.ton,
      'قیمت(Toman)': order?.service.irr.toLocaleString('en-IR'),
      'تاریخ پرداخت': order?.orderPlaced ? formatOrderTime(order?.orderPlaced) : 'ناموجود'

    }), [order])



  const { icon: StatusIcon, color, text: statusText } = getOrderStatus(order ? order.status : null)

  // handle complete Order
  const handleCompleteOrder = async () => {
    const { success } = await completeOrder(orderId)
    if (success) {
      setOrder(prev => prev ? { ...prev, status: 'completed' } : null)
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return <SkeletonAnimationWrapper key='order-details-skeleton'>
        <OrderDetailsSkeleton />
      </SkeletonAnimationWrapper>
    }

    if (error) {
      return <TryAgainModal onRetry={refetch} message={error.response?.data.message} />
    }

    if (!order) return null

    return <ContentAnimationWrapper key='order-details'>
      <Link to="/admin/manage-orders" className="flex items-center text-blue-500 mb-4">
        بازگشت به لیست سفارشات
        <ArrowLeft className="size-5 mr-1" />
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">جزئیات سفارش</h1>
        <div className="space-y-3">
          {orderFields.map(([fieldName, value], index) => (
            <ManageOrderDetailsField key={index} name={fieldName}>
              {value}
            </ManageOrderDetailsField>

          ))}

          <div className="flex items-center">
            <strong className="mr-2">وضعیت:</strong>
            <span className={`flex items-center gap-1 mr-1 ${color}`}>
              {StatusIcon && <StatusIcon className='size-5 mt-1' />}
              <p>{statusText}</p>
            </span>
          </div>
        </div>
        {order.status !== 'completed' && (
          <Button
            onClick={handleCompleteOrder}
            className="mt-6 bg-green-500 hover:bg-green-600"
            disabled={isCompleting}
          >
            {isCompleting ? 'در حال تکمیل...' : 'تکمیل سفارش'}
          </Button>
        )}
        {completedError &&
          <span className='block mt-2 text-red-500 font-thin border-b border-red-400 w-fit break-words'>
            {completedError?.message || 'مشکلی پیش امده است'}
          </span>}
      </div>
    </ContentAnimationWrapper>
  }

  return (
    <Container title='جزئیات سفارش'>
      <AnimatePresence mode='wait'>
        {renderContent()}
      </AnimatePresence>
    </Container>
  )
}

export default ManageOrderDetailsPage