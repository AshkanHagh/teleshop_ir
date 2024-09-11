import { Clock, Shield, Star, Zap } from "lucide-react"
import { GetIconVariants, PremiumOption } from "../../types/types"
import Button from "./Button"
import { useState } from "react"
import PaymentModal from "./PaymentModal"

type TGPremiumCardProps = {
  option: PremiumOption
}

const getIcon = (variant: GetIconVariants) => {
  switch (variant) {
    case '1-month':
      return <Clock className="size-6 text-blue-500" />
    case '6-month':
      return <Star className="size-6 text-yellow-500" />
    case '1-year':
      return <Zap className="size-6 text-purple-500" />
  }
}

const TGPremiumCard: React.FC<TGPremiumCardProps> = ({ option }) => {
  const [showModal, setShowModal] = useState<boolean>(false)

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          {getIcon(option.icon)}
          <h2 className="text-xl font-semibold text-gray-800 mb-1 mr-1">{option.duration}</h2>
        </div>

        <ul className="text-sm text-gray-600 mb-4 flex-grow">
          {option.features.map((feature, index) => (
            <li key={index} className="flex items-center mb-2 ">
              <Shield className="size-4 mr-2 text-green-500" />
              <p className='mb-1 mr-1'>{feature}</p>
            </li>
          ))}
        </ul>

        <p className="text-lg font-bold text-gray-800 mb-2">
          {option.priceTon} TON
        </p>
        <p className="text-sm text-gray-600 mb-4">
          {option.priceRial.toLocaleString()} ريال
        </p>

        <Button onClick={() => setShowModal(true)}>
          انتخاب
        </Button>
      </div>

      {/* Payment modal */}
      {showModal && <PaymentModal
        optionId={option.id}
        setShowModal={setShowModal}
        defaultUsername="shahin" />}
    </>
  )
}

export default TGPremiumCard