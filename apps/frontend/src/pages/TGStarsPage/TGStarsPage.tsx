import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'
import Button from '../../components/ui/Button'
import Container from '../../components/layout/Container'
import PaymentModal from '../../components/ui/PaymentModal'
import { UserFormData } from '../../types/types'

const TGStarsPage = () => {
    const [showModal, setShowModal] = useState<boolean>(false)
    const starCounts = [
        50,
        75,
        100,
        150,
        250,
        350,
        500,
        750,
        1000,
        1500,
        2500,
        5000,
        10000,
        25000]
    const [starCountsIndex, setStarCountIndex] = useState<number>(0)

    const pricePerStarTON = 0.1 // Example price in TON, adjust as needed
    const tonToRialRate = 300000 // Example exchange rate, adjust as needed


    const totalPriceTON = (starCounts[starCountsIndex] * pricePerStarTON).toFixed(2)
    const totalPriceRial = (parseFloat(totalPriceTON) * tonToRialRate).toLocaleString()

    const incrementStars = () => {
        setStarCountIndex(prev => {
            if (prev < starCounts.length - 1) {
                return prev + 1
            }
            return prev
        })
    }

    const decrementStars = () => {
        setStarCountIndex(prev => {
            if (prev > 0) {
                return prev - 1
            }
            return prev
        })
    }

    const handleModalSubmit = (userFormData: UserFormData) => {
        console.log(`Number of Stars: ${starCounts[starCountsIndex]}`)
        console.log(`username: ${userFormData.username}`)
        console.log(`Payment method: ${userFormData.paymentMethod}`)
    }

    return (
        <Container>
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6">خرید استار تلگرام</h1>

                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            disabled={starCountsIndex === starCounts.length - 1}
                            onClick={incrementStars}
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:hover:bg-blue-500"
                            aria-label="Decrease stars"
                        >
                            <ChevronRight size={24} />
                        </button>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600">{starCounts[starCountsIndex]}</div>
                            <div className="text-sm text-gray-600">Stars</div>
                        </div>
                        <button
                            disabled={starCountsIndex === 0}
                            onClick={decrementStars}
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-70 disabled:hover:bg-blue-500"
                            aria-label="Increase stars"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                    <div className="flex justify-center">
                        {[...Array(5)].map((_, index) => (
                            <Star key={index} className="w-6 h-6 text-yellow-400 fill-current" />
                        ))}
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-700">قیمت کل:</span>
                        <div className="text-left">
                            <p className="text-xl font-bold text-blue-600">{totalPriceTON} TON</p>
                            <p className="text-sm text-gray-600">{totalPriceRial} ریال</p>
                        </div>
                    </div>
                </div>

                <Button onClick={() => setShowModal(true)} className='flex justify-center items-center gap-1'>
                    <ShoppingCart />
                    <p className='mb-1 font-bold'>خرید</p>
                </Button>
            </div>
            {showModal && <PaymentModal
                setShowModal={setShowModal}
                handleSubmit={handleModalSubmit}

            />}
        </Container>
    )
}

export default TGStarsPage