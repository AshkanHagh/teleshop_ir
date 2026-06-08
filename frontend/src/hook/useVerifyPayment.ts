import { useEffect, useState } from "react"
import { Statuses } from "../pages/payment-verify/PaymentVerifyPage"
import { AxiosError } from "axios"
import { ResponseError } from "../types/types"
import useAxios from "./useAxios"

type UseVerifyPaymentQueryParams = {
  Authority: string | undefined
  Status: string | undefined
}

const useVerifyPayment = (
  setStatus: React.Dispatch<React.SetStateAction<Statuses>>,
  { Authority, Status }: UseVerifyPaymentQueryParams
) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const axios = useAxios()

  const fetchData = async () => {
    setStatus("loading")
    try {
      if (!Authority || !Status) throw Error()
      await axios.get(
        `payments/irr/verify?Authority=${Authority}&Status=${Status}`
      )
      setStatus("success")
    } catch (e) {
      const error = e as AxiosError<ResponseError>
      setErrorMessage(error.response?.data.message ?? null)
      setStatus("failure")
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  return { errorMessage }
}

export default useVerifyPayment
