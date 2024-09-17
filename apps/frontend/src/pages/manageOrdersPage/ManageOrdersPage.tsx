import Container from '../../components/layout/Container'
import { Order } from '../../types/types'
import OrderItem from './ManageOrderItem'
import OrderItemSkeleton from './ManageOrderItemSkeleton'

const orders: Order[] = [
    { id: '1', username: 'user1', serviceName: 'Telegram Premium', status: 'In Progress' },
    { id: '2', username: 'user2', serviceName: 'Telegram Stars', status: 'Completed' },
    { id: '3', username: 'user3', serviceName: 'Telegram Premium', status: 'Completed' },
]

const OrderListPage = () => {

    return (
        <Container title='سفارشات'>
            {false ?
                [1, 2, 3].map(key => <OrderItemSkeleton key={key} />)
                :
                <ul className="space-y-4">
                    {orders.map((order) => (
                        <OrderItem key={order.id} order={order} />
                    ))}
                </ul>}
        </Container>
    )
}

export default OrderListPage