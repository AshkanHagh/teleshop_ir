import { useCallback, useEffect, useState } from "react"
import { AxiosError } from "axios"
import { ResponseError } from "../types/types"

interface Order {
    id: string
    serviceName: string
    orderDate: string
    status: 'Pending' | 'In Progress' | 'Completed'
}

type ResponseType = {
    success: boolean
    data: Order[]
}

type FetchState = {
    isLoading: boolean
    error: AxiosError<ResponseError> | undefined
    data: ResponseType | undefined
}

type UseGetOrderHistoryReturnType = [
    () => void,
    FetchState
]

const mockOrders: Order[] = [
]

const useGetOrderHistory = (): UseGetOrderHistoryReturnType => {
    const [data, setData] = useState<ResponseType>()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<AxiosError<ResponseError>>()

    const tg = Telegram.WebApp

    const fetchUserData = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await new Promise<Order[]>(resolve => setTimeout(() => resolve(mockOrders), 2000))
            const response = { success: true, data: res }
            setData(response)
            setError(undefined)

        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setError(error)
        } finally {
            setIsLoading(false)
        }
    }, [tg.initData])

    useEffect(() => {
        fetchUserData()
    }, [])

    return [fetchUserData, { isLoading, data, error }]
}

export default useGetOrderHistory