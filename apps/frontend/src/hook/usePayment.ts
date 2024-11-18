import { useState } from "react"
import { OrderServiceName, PaymentMethod, ResponseError } from "../types/types"
import axiosInstance from "../api/axios"
import { AxiosError, AxiosResponse } from "axios"

type UserPaymentData = {
    id: string
    username: string
    paymentMethod: PaymentMethod
    service: OrderServiceName
}

type PaymentResponseData = {
    success: boolean
    paymentUrl: string
}

type PaymentSendData = {
    service: OrderServiceName
    username: string
}

type ProcessPaymentReturn = {
    success: boolean
    data: PaymentResponseData | null
}

type UsePaymentReturn = [
    ({ id, username, paymentMethod, service }: UserPaymentData) => Promise<ProcessPaymentReturn>,
    {
        isLoading: boolean
        error: AxiosError<ResponseError> | null
    }
]

const usePayment = (): UsePaymentReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<AxiosError<ResponseError> | null>(null)

    const handlePayment = async ({ id, username, paymentMethod, service }: UserPaymentData): Promise<ProcessPaymentReturn> => {
        setError(null)
        setIsLoading(true)
        try {
            const response = await axiosInstance.post<PaymentResponseData, AxiosResponse<PaymentResponseData>, PaymentSendData>(`payments/${paymentMethod}/${id}`, {
                username,
                service
            })
            return { success: response.data.success, data: response.data }
        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setError(error)
            return { success: false, data: null }
        } finally {
            setIsLoading(false)
        }
    }

    return [handlePayment, { isLoading, error }]
}

export default usePayment