import React, { useState } from "react"
import { X, Banknote, Coins } from "lucide-react"
import Button from "./Button"
import { PaymentMethod, ResponseError, UserFormData } from "../../types/types"
import { motion } from "framer-motion"
import { useAuthContext } from "../../context/AuthContext"
import { AxiosError } from "axios"

type PaymentModalProps = {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  handleSubmit: (userFormData: UserFormData) => void
  isLoading: boolean
  error: AxiosError<ResponseError> | null
}

const paymentModalVariant = {
  hidden: {
    opacity: 0,
    scaleY: 0,
    scaleX: 0.5
  },
  visible: {
    opacity: 1,
    x: 0,
    scaleY: 1,
    scaleX: 1,
    transition: {
      type: "spring",
      ease: "backInOut",
      duration: 0.7
    }
  },
  exit: {
    opacity: 0,
    scaleY: 0,
    scaleX: 0.5
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  setShowModal,
  handleSubmit,
  isLoading,
  error
}) => {
  const { user } = useAuthContext()
  const [username, setUsername] = useState<string | undefined>(user?.username)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("irr")
  const tg = Telegram.WebApp

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return
    const userFormData: UserFormData = {
      username,
      paymentMethod
    }
    handleSubmit(userFormData)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        variants={paymentModalVariant}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">جزئیات پرداخت</h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="size-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              نام کاربری تلگرام
            </label>
            <input
              type="text"
              id="username"
              value={username}
              placeholder="@example"
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoComplete="off"
            />
          </div>
          <div className="mb-6">
            <p className="block text-sm font-medium text-gray-700 mb-2">
              روش پرداخت را انتخاب کنید
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("irr")}
                className={`flex items-center justify-center px-4 py-2 border ${
                  paymentMethod === "irr"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                } rounded-md hover:bg-gray-50`}
              >
                <Banknote className="size-4 mr-2" />
                <p className="mr-0.5 mb-1">ریال</p>
              </button>
              <button
                type="button"
                onClick={() =>
                  tg.showAlert(
                    "پرداخت با TON امکان‌پذیر نیست. لطفاً از طریق تلگرام به پشتیبانی پیام دهید."
                  )
                }
                className={`flex items-center justify-center px-4 py-2 border ${
                  paymentMethod === "ton"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                } rounded-md hover:bg-gray-50`}
              >
                <Coins className="size-4 mr-2" />
                <p className="mr-1">TON</p>
              </button>
            </div>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "درحال پرداخت. . ." : "پرداخت"}
          </Button>
          {error && (
            <span className="block mt-2 text-red-500 font-thin border-b border-red-400 w-fit break-words">
              {error.response?.data.message || "مشکلی پیش امده است"}
            </span>
          )}
        </form>
      </motion.div>
    </motion.div>
  )
}

export default PaymentModal
