const OrderHistoryItemSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-40"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-[4.5rem]"></div>
      </div>
    </div>
  )
}

export default OrderHistoryItemSkeleton
