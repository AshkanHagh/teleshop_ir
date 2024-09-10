const TGPremiumCardSkeleton = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col h-full animate-pulse mt-5">
            <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <div className="h-6 bg-gray-300 rounded w-1/3 ml-2"></div>
            </div>
            <ul className="mb-4 flex-grow">
                {[1, 2, 3].map((_, index) => (
                    <li key={index} className="flex items-center mb-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </li>
                ))}
            </ul>
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
        </div>
    )
}

export default TGPremiumCardSkeleton