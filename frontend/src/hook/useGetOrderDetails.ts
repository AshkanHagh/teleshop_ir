import { useEffect, useState } from "react"
import { AxiosError } from "axios"
import { OrderDetails, ResponseError } from "../types/types"
import useAxios from "./useAxios"

type OrderDetailsResponse = {
  orderDetails: OrderDetails
  success: true
}

type ReturnType = [
  () => {},
  {
    data: OrderDetails | null
    isLoading: boolean
    error: AxiosError<ResponseError> | null
    setData: React.Dispatch<React.SetStateAction<OrderDetails | null>>
  }
]

const useGetManageOrderDetails = (
  endpoint: string,
  orderId: string | undefined
): ReturnType => {
  const [data, setData] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AxiosError<ResponseError> | null>(null)
  const axios = useAxios()

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    const hasTrailingSlash = endpoint.charAt(endpoint.length - 1) === "/"
    const trailingSlash = !hasTrailingSlash ? "/" : ""
    try {
      const response = await axios.get<OrderDetailsResponse>(
        `${endpoint}${trailingSlash}${orderId}`
      )
      setData(response.data.orderDetails)
    } catch (e) {
      const error = e as AxiosError<ResponseError>
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!orderId) return setData(null)

    fetchData()
  }, [])

  return [fetchData, { data, isLoading, error, setData }]
}

export default useGetManageOrderDetails
