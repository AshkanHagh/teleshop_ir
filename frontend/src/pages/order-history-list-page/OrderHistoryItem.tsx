import { Link } from "react-router-dom"
import getOrderStatus from "../../utils/getOrderStatus"
import { OrderServiceName, OrderStatus } from "../../types/types"
import formatOrderTime from "../../utils/formatOrderTime"

interface OrderItemProps {
  id: string
  serviceName: "star" | "premium"
  orderPlaced: string
  status: OrderStatus
}

const formatServiceName = (service: OrderServiceName) => {
  switch (service) {
    case "premium":
      return "اکانت پریمیوم"
    case "star":
      return "استارس تلگرام"
  }
}

const OrderHistoryItem = ({
  serviceName,
  orderPlaced,
  status,
  id
}: OrderItemProps) => {
  const { icon: StatusIcon, color, bgColor, text } = getOrderStatus(status)

  return (
    <Link to={id}>
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg text-gray-800">
              {formatServiceName(serviceName)}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {formatOrderTime(orderPlaced)}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full shrink-0 ${color} ${bgColor}`}
          >
            {StatusIcon && <StatusIcon className="size-4 mr-1" />}
            <span className="text-sm font-medium mb-1 text-center">{text}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default OrderHistoryItem
