import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import Button from "../../components/ui/Button"
import PaymentModal from "../../components/ui/PaymentModal"
import { UserFormData } from "../../types/types"
import { AnimatePresence } from "framer-motion"
import StarsSelectorCard from "./StarsSelectorCard"
import { useStarContext } from "../../context/StarContext"
import TotalPriceCard from "./TotalPriceCard"
import usePayment from "../../hook/usePayment"

const TGStarsContent = () => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const {
    currentStar,
    isLoading: starLoading,
    error: starError
  } = useStarContext()
  const [fetchPaymentData, { error: paymentError, isLoading: paymentLoading }] =
    usePayment()
  const tg = Telegram.WebApp

  const handleModalSubmit = async (userFormData: UserFormData) => {
    if (!currentStar) return
    const { data } = await fetchPaymentData({
      ...userFormData,
      service: "star",
      serviceId: currentStar.id
    })

    if (data?.success) {
      tg.openLink(data.paymentUrl)
    }
  }

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          خرید استار تلگرام
        </h1>

        <StarsSelectorCard />
        <TotalPriceCard />

        <Button
          disabled={starLoading || starError !== null}
          onClick={() => setShowModal(true)}
          className="flex justify-center items-center gap-1"
        >
          <ShoppingCart />
          <p className="mb-1 font-bold">خرید</p>
        </Button>
      </div>
      <AnimatePresence>
        {showModal && (
          <PaymentModal
            setShowModal={setShowModal}
            handleSubmit={handleModalSubmit}
            isLoading={paymentLoading}
            error={paymentError}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default TGStarsContent
