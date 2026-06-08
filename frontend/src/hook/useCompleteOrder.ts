import { useState } from "react"
import { ResponseError } from "../types/types"
import { AxiosError } from "axios"
import useAxios from "./useAxios"

type UseCompleteOrderStateReturnType = {
  isCompleting: boolean
  completedError: ResponseError | null
}

type HandleCompleteOrder = Promise<{
  success: boolean
}>

const useCompleteOrder = () => {
  const [isCompleting, setIsCompleting] = useState<boolean>(false)
  const [completedError, setCompleteError] = useState<ResponseError | null>(
    null
  )
  const axios = useAxios()

  const handleCompleteOrder = async (
    orderId: string | undefined
  ): HandleCompleteOrder => {
    setIsCompleting(true)
    setCompleteError(null)
    try {
      if (!orderId) throw new Error("سفارش شما معتبر نیست!")

      await axios.patch(`/dashboard/admin/${orderId}`)
      return { success: true }
    } catch (e) {
      const error = e as AxiosError<ResponseError>
      setCompleteError(error.response?.data ?? null)
      return { success: false }
    } finally {
      setIsCompleting(false)
    }
  }

  return [handleCompleteOrder, { isCompleting, completedError }] as [
    typeof handleCompleteOrder,
    UseCompleteOrderStateReturnType
  ]
}

export default useCompleteOrder
