function OrderItemSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 animate-pulse mb-3">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-26"></div>
          <div className="h-4 bg-gray-200 rounded w-10"></div>
          <div className="h-3 bg-gray-200 rounded w-36"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-6 bg-gray-200 rounded-full mr-1"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

export default OrderItemSkeleton
