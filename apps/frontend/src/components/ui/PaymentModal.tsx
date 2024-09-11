import React, { useState } from 'react'
import { X, DollarSign, Coins } from 'lucide-react'
import Button from './Button'
import { PaymentMethod, UserFormData } from '../../types/types'

type PaymentModalProps = {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  handleSubmit: (userFormData: UserFormData) => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  setShowModal,
  handleSubmit }) => {
  const [username, setUsername] = useState<string>('shahin')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('rial')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const userFormData: UserFormData = {
      username,
      paymentMethod,
    }
    handleSubmit(userFormData)
  }



  return (
    <div className="p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">جزئیات پرداخت</h2>
            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
              <X className="size-6" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="p-6">
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                نام کاربری تلگرام
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>
            <div className="mb-6">
              <p className="block text-sm font-medium text-gray-700 mb-2">روش پرداخت را انتخاب کنید</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('rial')}
                  className={`flex items-center justify-center px-4 py-2 border ${paymentMethod === 'rial' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    } rounded-md hover:bg-gray-50`}
                >
                  <DollarSign className="size-4 mr-2" />
                  <p className='mr-0.5 mb-1'>ریال</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ton')}
                  className={`flex items-center justify-center px-4 py-2 border ${paymentMethod === 'ton' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    } rounded-md hover:bg-gray-50`}
                >
                  <Coins className="size-4 mr-2" />
                  <p className='mr-1'>TON</p>
                </button>
              </div>
            </div>
            <Button type="submit">
              پرداخت
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal