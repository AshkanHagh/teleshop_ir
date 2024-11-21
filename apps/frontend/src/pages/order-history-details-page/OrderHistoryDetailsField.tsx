type OrderHistoryDetailFieldProps = {
  children: React.ReactNode
  fieldName: string
}

const OrderHistoryDetailField: React.FC<OrderHistoryDetailFieldProps> = ({ fieldName, children }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center text-gray-600">
        <span>{fieldName}:</span>
      </div>
      <span className="font-semibold">{children}</span>
    </div>
  )
}

export default OrderHistoryDetailField