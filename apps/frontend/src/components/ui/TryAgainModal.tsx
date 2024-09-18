import { RefreshCw, AlertCircle, X } from 'lucide-react'
import Button from './Button'

type TryAgainModalProps = {
    onRetry: () => void
    message: string
}

const TryAgainModal: React.FC<TryAgainModalProps> = ({ message, onRetry }) => {
    const tg = Telegram.WebApp

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full relative">
                <button
                    onClick={tg.close}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="بستن"
                >
                    <X className="size-6" />
                </button>
                <div className="flex flex-col items-center p-6 text-center">
                    <AlertCircle className="size-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">خطا رخ داد</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex flex-col sm:flex-row gap-4 self-stretch">
                        <Button
                            onClick={onRetry}
                            className='flex items-center justify-center gap-1'
                        >
                            <RefreshCw className="size-5 mr-2" />
                            <p className='mr-1'>تلاش مجدد</p>
                        </Button>
                        <button
                            onClick={tg.close}
                            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            بستن برنامه
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TryAgainModal