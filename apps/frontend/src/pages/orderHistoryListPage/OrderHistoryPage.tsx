import Container from '../../components/layout/Container'
import OrderItem from './OrderHistoryItem'
import OrderHistoryItemSkeleton from './OrderHistoryItemSkeleton'

interface Order {
    id: string
    serviceName: string
    orderDate: string
    status: 'Pending' | 'In Progress' | 'Completed'
}

const orders: Order[] = [
    { id: '1', serviceName: 'اکانت پرمیوم تلگرام', orderDate: '۱۴۰۲/۰۳/۱۵', status: 'Completed' },
    { id: '2', serviceName: 'خرید استارس تلگرام', orderDate: '۱۴۰۲/۰۳/۲۰', status: 'In Progress' },
    { id: '3', serviceName: 'اکانت پرمیوم تلگرام', orderDate: '۱۴۰۲/۰۳/۲۵', status: 'Pending' },
]

const OrderHistoryPage = () => {
    return (
        <Container title='سفارش های من'>
            {false
                ?
                [...Array(4)].map((_, index) => <OrderHistoryItemSkeleton key={index} />)
                :
                orders.map((order) => (
                    <OrderItem
                        key={order.id}
                        id={order.id}
                        serviceName={order.serviceName}
                        orderDate={order.orderDate}
                        status={order.status}
                    />
                ))}
        </Container>
    )
}

export default OrderHistoryPage