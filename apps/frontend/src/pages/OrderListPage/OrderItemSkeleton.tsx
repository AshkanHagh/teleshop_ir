function OrderItemSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center">
          <div className="size-5 bg-gray-200 rounded-full mr-1"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

export default OrderItemSkeleton