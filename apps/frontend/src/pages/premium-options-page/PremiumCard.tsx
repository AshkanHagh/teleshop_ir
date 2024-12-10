import { Clock, Shield, Star, Zap } from "lucide-react"
import { PremiumIconVariants, UserFormData } from "../../types/types"
import Button from "../../components/ui/Button"
import { useState } from "react"
import PaymentModal from "../../components/ui/PaymentModal"
import { AnimatePresence } from "framer-motion"
import usePayment from "../../hook/usePayment"

type TGPremiumCardProps = {
  id: string
  icon: PremiumIconVariants
  duration: string
  features: string[]
  ton: number
  irr: number
}

const getIcon = (variant: PremiumIconVariants) => {
  switch (variant) {
    case '3-month':
      return <Clock className="size-6 text-blue-500" />
    case '6-month':
      return <Star className="size-6 text-yellow-500" />
    case '1-year':
      return <Zap className="size-6 text-purple-500" />
  }
}

const TGPremiumCard: React.FC<TGPremiumCardProps> = ({ id, icon, duration, features, ton, irr }) => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [fetchPaymentData, { isLoading, error }] = usePayment()
  const tg = Telegram.WebApp
  const handleModalSubmit = async (userFormData: UserFormData) => {
    const { data } = await fetchPaymentData({ ...userFormData, serviceId: id, service: 'premium' })
    if (data?.success) {
      tg.openLink(data.paymentUrl)
    }
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          {getIcon(icon)}
          <h2 className="text-xl font-semibold text-gray-800 mb-1 mr-1">{duration}</h2>
        </div>

        <ul className="text-sm text-gray-600 mb-4 flex-grow">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center mb-2 ">
              <Shield className="size-4 mr-2 text-green-500" />
              <p className='mb-1 mr-1'>{feature}</p>
            </li>
          ))}
        </ul>

        <p className="text-lg font-bold text-gray-800 mb-2">
          {ton} TON
        </p>
        <p className="text-sm text-gray-600 mb-4">
          {irr.toLocaleString()} ريال
        </p>

        <Button onClick={() => setShowModal(true)}>
          انتخاب
        </Button>
      </div>

      {/* Payment modal */}
      <AnimatePresence>
        {showModal && <PaymentModal
          setShowModal={setShowModal}
          handleSubmit={handleModalSubmit}
          isLoading={isLoading}
          error={error}

        />}
      </AnimatePresence>
    </>
  )
}

export default TGPremiumCard