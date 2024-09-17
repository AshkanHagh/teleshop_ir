import { useEffect, useState } from "react"
import axiosInstance from "../api/axios"
import { AxiosError } from "axios"
import { ResponseError, Service } from "../types/types"

const useGetServices = () => {
    const [data, setData] = useState<Service[]>([])
    const [error, setError] = useState<AxiosError<ResponseError>>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchServices = async () => {
        try {
            const response = await axiosInstance.get<Service[]>(`services/landing`)
            setData(response.data)
            setError(undefined)
        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setError(error)
            setData([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [])

    return [fetchServices, { isLoading, data, error }]
}

export default useGetServices