import { ClipboardX } from "lucide-react"

const NoOrders = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] p-4 bg-white rounded-lg shadow-sm">
            <ClipboardX className="w-16 h-16 text-blue-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">هیچ سفارشی موجود نیست</h2>
            <p className="text-sm text-gray-500 text-center max-w-[250px]">
                در حال حاضر هیچ سفارشی برای نمایش وجود ندارد.
            </p>
        </div>
    )
}

export default NoOrders