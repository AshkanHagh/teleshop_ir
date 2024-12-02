import { Link } from "react-router-dom"
import { ManageOrder } from "../../types/types"
import formatOrderTime from "../../utils/formatOrderTime"
import getOrderStatus from "../../utils/getOrderStatus"
import { Eye } from "lucide-react"

type OrderItemProps = {
  order: ManageOrder
}

export default function ManageOrderItem({ order }: OrderItemProps) {
  const { icon: StatusIcon, color, text } = getOrderStatus(order.status, {
    completedText: 'تکمیل شده',
    inProgressText: 'دیده شده',
    inProgressIcon: Eye
  })

  return (
    <li className={`mb-3 ${order.status === "completed" ? 'opacity-60' : ''}`}>
      <Link
        to={`${order.id}`}
        className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold">{order.username}</h2>
            <p className="text-sm text-gray-600">{order.service}</p>
            <p className="text-xs text-gray-500 mt-1">{formatOrderTime(order.orderPlaced)}</p>
          </div>
          <div className={`flex items-center ${color} gap-1`}>
            {StatusIcon && <StatusIcon className="size-5 mt-1" />}
            <span className="text-sm">{text}</span>
          </div>
        </div>
      </Link>
    </li>
  )
}
