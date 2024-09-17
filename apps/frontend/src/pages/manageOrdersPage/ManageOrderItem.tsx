import { CheckCircle, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { Order } from "../../types/types"

type OrderItemProp = {
    order: Order
}

const OrderItem: React.FC<OrderItemProp> = ({ order }) => {

    const isComplete = order.status === 'Completed'
    
    return (
        <li key={order.id}>
            <Link
                to={`${order.id}`}
                className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold">{order.username}</h2>
                        <p className="text-sm text-gray-600">{order.serviceName}</p>
                    </div>
                    <div className={`flex items-center ${isComplete ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                        {isComplete ? (
                            <CheckCircle className="size-5 mr-1" />
                        ) : (
                            <Clock className="size-5 mr-1" />
                        )}
                        <span className="text-sm mb-1 mr-1">{isComplete ? 'تکمیل شد' : 'در حال انجام'}</span>
                    </div>
                </div>
            </Link>
        </li>
    )
}

export default OrderItem