import { useEffect, useState } from "react"
import axiosInstance from "../api/axios"
import { AxiosError } from "axios"
import { ManageOrderDetails, ResponseError } from "../types/types"

type OrderDetailResponse = {
    orderDetail: ManageOrderDetails,
    success: true
}

type ReturnType = [
    () => {},
    {
        data: ManageOrderDetails | null,
        isLoading: boolean,
        error: AxiosError<ResponseError> | null,
        setData: React.Dispatch<React.SetStateAction<ManageOrderDetails | null>>
    }
]

const useGetManageOrderDetails = (orderId: string | undefined): ReturnType => {
    const [data, setData] = useState<ManageOrderDetails | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<AxiosError<ResponseError> | null>(null)
    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get<OrderDetailResponse>(`/dashboard/admin/${orderId}`)
            setData(response.data.orderDetail)
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
    console.log(data)

    return [fetchData, { data, isLoading, error, setData }]
}

export default useGetManageOrderDetails
