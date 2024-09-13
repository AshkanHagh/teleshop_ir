import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, CheckCircle, Clock } from 'lucide-react'
import Container from '../../components/layout/Container'
import OrderDetailsSkeleton from './OrderDetailsSkeleton'
import OrderDetailsField from './OrderDetailsField'
import Button from '../../components/ui/Button'
import { OrderDetails } from '../../types/types'

const mockOrderDetails: OrderDetails = {
  id: '1',
  username: 'user1',
  serviceName: 'Telegram Stars',
  starsCount: 25000,
  tonPrice: 5,
  rialPrice: 1500000,
  paymentDate: '2023-06-15',
  status: 'In Progress'
}

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrder(mockOrderDetails)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [orderId])

  const handleCompleteOrder = () => {
    if (order) {
      // Simulate API call to update order status
      setOrder({ ...order, status: 'Completed' })
      // In a real application, you would make an API call here
      // After successful API call, you might want to redirect:
      // navigate('/orders')
    }
  }

  if (isLoading) {
    return (
      <OrderDetailsSkeleton />
    )
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto p-4">
        <Link to="/orders" className="flex items-center text-blue-500 mb-4">
          بازگشت به لیست سفارشات
          <ArrowLeft className="size-5 mr-1" />
        </Link>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          سفارش یافت نشد
        </div>
      </div>
    )
  }

  return (
    <Container>
      <Link to="/orders" className="flex items-center text-blue-500 mb-4">
        بازگشت به لیست سفارشات
        <ArrowLeft className="size-5 mr-1" />
      </Link>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-4">جزئیات سفارش</h1>
        <div className="space-y-3">
          <OrderDetailsField name='نام کاربری'>{order.username}</OrderDetailsField>
          <OrderDetailsField name='نام سرویس'>{order.serviceName}</OrderDetailsField>
          <OrderDetailsField name='قیمت(TON)'>{order.tonPrice}</OrderDetailsField>
          <OrderDetailsField name='قیمت(Rial)'>{order.rialPrice}</OrderDetailsField>
          <OrderDetailsField name='تاریخ پرداخت'>{order.paymentDate}</OrderDetailsField>
          <div className="flex items-center">
            <strong className="mr-2">وضعیت:</strong>
            <span className={`flex items-center gap-1 mr-1 ${order.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>
              {order.status === 'Completed' ? (
                <>
                  <CheckCircle className="size-5 mr-1" />
                  <p>تکمیل شده</p>
                </>
              ) : (
                <>
                  <Clock className="size-5 mr-1" />
                  <p>در حال انجام</p>
                </>
              )}
            </span>
          </div>
        </div>
        {order.status !== 'Completed' && (
          <Button
            onClick={handleCompleteOrder}
            className="mt-6 bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            تکمیل سفارش
          </Button>
        )}
      </div>
    </Container>
  )
}

export default OrderDetailsPage