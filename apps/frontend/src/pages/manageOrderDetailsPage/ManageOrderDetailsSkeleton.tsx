const ManageOrderDetailsSkeleton = () => {
    return (
        <div className="max-w-md mx-auto p-4">
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                        <div key={index} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ManageOrderDetailsSkeleton