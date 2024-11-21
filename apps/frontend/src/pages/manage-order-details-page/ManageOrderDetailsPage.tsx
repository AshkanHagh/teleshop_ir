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
import { useMemo, useState } from 'react'
import { AxiosError } from 'axios'
import { ResponseError } from '../../types/types'
import axiosInstance from '../../api/axios'
import formatOrderTime from '../../utils/formatOrderTime'

const ManageOrderDetailsPage: React.FC = () => {

  const [isCompleting, setIsCompleting] = useState<boolean>(false)
  const [completedError, setCompleteError] = useState<AxiosError<ResponseError> | null>(null)
  const { orderId } = useParams()
  const [refetch, { data: order, error, isLoading, setData: setOrder }] = useGetOrderDetails(`/dashboard/admin`, orderId)

  const orderFields = useMemo(() =>
    Object.entries({
      'نام کاربری': order?.username,
      'نام سرویس': order?.service.serviceName,
      'قیمت(TON)': order?.service.tonQuantity,
      'قیمت(Toman)': order?.service.irrPrice.toLocaleString('en-IR'),
      'تاریخ پرداخت': order?.orderPlaced ? formatOrderTime(order?.orderPlaced) : 'ناموجود'

    }), [order])



  const { icon: StatusIcon, color, text: statusText } = getOrderStatus(order ? order.status : null)
  const handleCompleteOrder = async () => {
    setIsCompleting(true)
    setCompleteError(null)

    try {
      await axiosInstance.patch(`/dashboard/admin/${orderId}`)
      setOrder(prev => prev ? { ...prev, status: 'completed' } : null)
    } catch (e) {
      const error = e as AxiosError<ResponseError>
      setCompleteError(error)
    } finally {
      setIsCompleting(false)
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
            {completedError.response?.data.message || 'مشکلی پیش امده است'}
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