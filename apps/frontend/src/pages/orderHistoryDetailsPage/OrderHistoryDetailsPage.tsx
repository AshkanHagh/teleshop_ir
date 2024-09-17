import Container from '../../components/layout/Container'
import getOrderStatus from '../../utils/getOrderStatus'
import OrderHistoryDetailsSkeleton from './OrderHistoryDetails'
import OrderHistoryDetailField from './OrderHistoryDetailsField'

interface OrderDetailsProps {
    orderNumber: string
    orderDate: string
    orderStatus: 'Pending' | 'In Progress' | 'Completed'
    serviceName: string
    price: number
    paymentMethod: 'TON' | 'Rial'
}

const orderData: OrderDetailsProps = {
    orderNumber: '1234567890',
    orderDate: '۱۴۰۲/۰۳/۱۵',
    orderStatus: 'In Progress' as const,
    serviceName: 'اکانت پرمیوم تلگرام',
    price: 500000,
    paymentMethod: 'Rial' as const
}

const OrderHistoryDetailPage = () => {
    const { icon: StatusIcon, color, bgColor, text: statusText } = getOrderStatus(orderData.orderStatus)

    const orderFields = Object.entries({
        'شماره سفارش': orderData.orderNumber,
        'تاریخ سفارش': orderData.orderDate,
        'نام سرویس': orderData.serviceName,
        'قیمت': `${orderData.price.toLocaleString()} ${orderData.paymentMethod === 'TON' ? 'TON' : 'ریال'}`,
        'روش پرداخت': orderData.paymentMethod,
    })

    return (
        <Container>
            {false
                ? 
                    <OrderHistoryDetailsSkeleton />
                :
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">جزئیات سفارش</h2>

                    <div className="space-y-4">
                        {orderFields.map(([fieldName, value]) => (
                            <OrderHistoryDetailField key={fieldName} fieldName={fieldName}>
                                {value}
                            </OrderHistoryDetailField>
                        ))}

                        <div className="border-t border-gray-200 my-4"></div>

                        <OrderHistoryDetailField fieldName="وضعیت سفارش">
                            <div className={`flex items-center ${color} ${bgColor} px-3 py-1 rounded-full gap-1`}>
                                <StatusIcon size='17' />
                                <span className="text-sm font-medium mb-1">{statusText}</span>
                            </div>
                        </OrderHistoryDetailField>
                    </div>
                </div>}
        </Container>
    )
}

export default OrderHistoryDetailPage
