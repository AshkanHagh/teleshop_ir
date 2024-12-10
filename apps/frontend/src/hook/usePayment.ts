import { useState } from "react"
import { OrderServiceName, PaymentMethod, ResponseError } from "../types/types"
import { AxiosError, AxiosResponse } from "axios"
import useAxios from "./useAxios"

type UserPaymentData = {
    serviceId: string
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
    data: PaymentResponseData | null
}

type UsePaymentReturn = [
    ({ serviceId, username, paymentMethod, service }: UserPaymentData) => Promise<ProcessPaymentReturn>,
    {
        isLoading: boolean
        error: AxiosError<ResponseError> | null
    }
]

const usePayment = (): UsePaymentReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<AxiosError<ResponseError> | null>(null)
    const axios = useAxios()

    const handlePayment = async ({ serviceId, username, paymentMethod, service }: UserPaymentData): Promise<ProcessPaymentReturn> => {
        setError(null)
        setIsLoading(true)
        try {
            const response = await axios.post<PaymentResponseData, AxiosResponse<PaymentResponseData>, PaymentSendData>(`payments/${paymentMethod}/${serviceId}`, {
                username,
                service
            })
            return { data: response.data }
        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setError(error)
            return { data: null }
        } finally {
            setIsLoading(false)
        }
    }

    return [handlePayment, { isLoading, error }]
}

export default usePayment