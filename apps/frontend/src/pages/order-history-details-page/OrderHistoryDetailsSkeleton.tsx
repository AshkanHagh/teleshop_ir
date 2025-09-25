const OrderHistoryDetailsSkeleton = () => {
  return (
    <div className="space-y-5 p-3">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-7 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
      <div className="border-t border-gray-200 my-4"></div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  )
}

export default OrderHistoryDetailsSkeleton
