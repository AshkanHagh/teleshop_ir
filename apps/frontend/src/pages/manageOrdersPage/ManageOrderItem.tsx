import { CheckCircle, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { ManageOrder } from "../../types/types"
import formatOrderTime from "../../utils/formatOrderTime"

type OrderItemProps = {
  order: ManageOrder
}

export default function OrderItem({ order }: OrderItemProps) {
  const isComplete = order.status === 'Completed'
  const orderDate = new Date(order.createdAt)

  return (
    <li>
      <Link
        to={`${order.id}`}
        className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold">{order.username}</h2>
            <p className="text-sm text-gray-600">{order.serviceName}</p>
            <p className="text-xs text-gray-500 mt-1">{formatOrderTime(orderDate)}</p>
          </div>
          <div className={`flex items-center ${isComplete ? 'text-green-500' : 'text-yellow-500'}`}>
            {isComplete ? (
              <CheckCircle className="w-5 h-5 mr-1" />
            ) : (
              <Clock className="w-5 h-5 mr-1" />
            )}
            <span className="text-sm">{isComplete ? 'تکمیل شد' : 'در حال انجام'}</span>
          </div>
        </div>
      </Link>
    </li>
  )
}
