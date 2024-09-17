import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import Container from '../../components/layout/Container'
import OrderDetailsSkeleton from './ManageOrderDetailsSkeleton'
import ManageOrderDetailsField from './ManageOrderDetailsField'
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

const ManageOrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<OrderDetails | null>()
  const isLoading = order === undefined
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrder(mockOrderDetails)
    }, 1000)

    return () => clearTimeout(timer)
  }, [orderId])

  const handleCompleteOrder = () => {
    if (order) {
      setOrder({ ...order, status: 'Completed' })
    }
  }

  if (order === null) {
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
    <Container title='جزئیات سفارش'>
      {
        isLoading ? <OrderDetailsSkeleton />
          : (<>
            <Link to="/admin/manage-orders" className="flex items-center text-blue-500 mb-4">
              بازگشت به لیست سفارشات
              <ArrowLeft className="size-5 mr-1" />
            </Link>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold mb-4">جزئیات سفارش</h1>
              <div className="space-y-3">
                <ManageOrderDetailsField name='نام کاربری'>{order.username}</ManageOrderDetailsField>
                <ManageOrderDetailsField name='نام سرویس'>{order.serviceName}</ManageOrderDetailsField>
                <ManageOrderDetailsField name='قیمت(TON)'>{order.tonPrice}</ManageOrderDetailsField>
                <ManageOrderDetailsField name='قیمت(Rial)'>{order.rialPrice}</ManageOrderDetailsField>
                <ManageOrderDetailsField name='تاریخ پرداخت'>{order.paymentDate}</ManageOrderDetailsField>
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
          </>)
      }
    </Container>
  )
}

export default ManageOrderDetailsPage