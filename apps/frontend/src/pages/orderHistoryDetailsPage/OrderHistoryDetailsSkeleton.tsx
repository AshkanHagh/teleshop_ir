const OrderHistoryDetailsSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>

      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderHistoryDetailsSkeleton