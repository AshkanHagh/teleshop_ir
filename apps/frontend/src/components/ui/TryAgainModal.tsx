import { RefreshCw, AlertCircle, X } from 'lucide-react'
import Button from './Button'
import { motion } from 'framer-motion'

type TryAgainModalProps = {
    onRetry: () => void
    message: string | undefined
}

const tryAgainModalVariants = {
    in: {
        y: -400,
        opacity: 0
    },
    out: {
        y: 0,
        opacity: 1
    },
}

const TryAgainModal: React.FC<TryAgainModalProps> = ({ message, onRetry }) => {
    const tg = Telegram.WebApp

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
                variants={tryAgainModalVariants}
                initial='in'
                animate='out'
                className="bg-white rounded-lg shadow-lg max-w-md w-full relative">
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
                    <p className="text-gray-600 mb-6">{message ?? 'لطفا اینترنت خود را برسی کرده و دوباره امتحان کنید'}</p>
                    <div className="flex flex-col sm:flex-row gap-4 self-stretch">
                        <Button
                            onClick={onRetry}
                            className='flex items-center justify-center gap-1 mt-0'
                        >
                            <RefreshCw className="size-5 mr-2" />
                            <p className='mr-1'>تلاش مجدد</p>
                        </Button>
                        <Button
                            onClick={tg.close}
                            className="bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 mt-0"
                        >
                            بستن برنامه
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default TryAgainModal