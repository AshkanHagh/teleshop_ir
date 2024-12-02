import { useEffect, useState } from "react"
import axiosInstance from "../api/axios"
import { Statuses } from "../pages/paymentVerify/PaymentVerifyPage"
import { AxiosError } from "axios"
import { ResponseError } from "../types/types"

type UseVerifyPaymentQueryParams = {
    Authority: string | undefined
    Status: string | undefined
}

const useVerifyPayment = (setStatus: React.Dispatch<React.SetStateAction<Statuses>>, { Authority, Status }: UseVerifyPaymentQueryParams) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const fetchData = async () => {
        setStatus('loading')
        try {
            if (!Authority || !Status) throw Error()
            await axiosInstance.get(`http://localhost:6610/api/payments/irr/verify?Authority=${Authority}&Status=${Status}`)
            setStatus('success')
        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setErrorMessage(error.response?.data.message ?? null)
            setStatus('failure')
        }
    }
    useEffect(() => {
        fetchData()
    }, [])

    return { errorMessage }
}

export default useVerifyPayment