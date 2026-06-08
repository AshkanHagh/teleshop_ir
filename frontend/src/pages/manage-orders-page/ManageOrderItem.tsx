import { Link } from "react-router-dom"
import { OrderServiceName, OrderStatus } from "../../types/types"
import formatOrderTime from "../../utils/formatOrderTime"
import getOrderStatus from "../../utils/getOrderStatus"
import { Eye } from "lucide-react"

type OrderItemProps = {
  id: string
  username: string
  serviceName: OrderServiceName
  orderPlaced: string
  status: OrderStatus
}

export default function ManageOrderItem({
  id,
  username,
  serviceName,
  orderPlaced,
  status
}: OrderItemProps) {
  const {
    icon: StatusIcon,
    color,
    text
  } = getOrderStatus(status, {
    completedText: "تکمیل شده",
    inProgressText: "دیده شده",
    inProgressIcon: Eye
  })

  return (
    <li className={`mb-3 ${status === "completed" ? "opacity-60" : ""}`}>
      <Link
        to={`${id}`}
        className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold">{username}</h2>
            <p className="text-sm text-gray-600">{serviceName}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatOrderTime(orderPlaced)}
            </p>
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
