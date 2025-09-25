function ServiceCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 flex flex-col justify-between h-full animate-pulse">
      <div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="mt-4 h-8 bg-gray-200 rounded-md w-full"></div>
    </div>
  )
}

export default ServiceCardSkeleton
