import { Link } from 'react-router-dom'
import getOrderStatus from '../../utils/getOrderStatus'

type OrderStatus = 'Pending' | 'In Progress' | 'Completed'

interface OrderItemProps {
    id: string
    serviceName: string
    orderDate: string
    status: OrderStatus
}

const OrderHistoryItem = ({ serviceName, orderDate, status, id }: OrderItemProps) => {
    const { icon: StatusIcon, color, bgColor, text } = getOrderStatus(status)

    return (
        <Link to={id}>
            <div className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{serviceName}</h3>
                        <p className="text-sm text-gray-600 mt-1">تاریخ سفارش: {orderDate}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${color} ${bgColor}`}>
                        <StatusIcon className="size-4 mr-1" />
                        <span className="text-sm font-medium mb-1 text-center">{text}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default OrderHistoryItem