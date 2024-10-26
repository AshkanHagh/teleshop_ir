import { useEffect, useState } from "react"
import axiosInstance from "../api/axios"
import { AxiosError, AxiosResponse } from "axios"
import { ResponseError, Service } from "../types/types"

type ResponseType = {
    services: Service[],
    success: boolean
}
type FetchState = {
    isLoading: boolean,
    data: AxiosResponse<ResponseType> | undefined,
    error: AxiosError<ResponseError> | undefined
}

type UseGetServicesReturnType = [
    () => void,
    FetchState
]

const useGetServices = (): UseGetServicesReturnType => {
    const [data, setData] = useState<AxiosResponse<ResponseType>>()
    const [error, setError] = useState<AxiosError<ResponseError>>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchServices = async () => {
        setIsLoading(true)
        const cache: AxiosResponse<ResponseType> = JSON.parse(localStorage.getItem('services') || 'null')
        if (cache) {
            setData(cache)
            setIsLoading(false)
            return
        }

        try {
            const response = await axiosInstance.get<ResponseType>(`services`)
            setData(response)
            localStorage.setItem('services', JSON.stringify(response))

            setError(undefined)
        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setError(error)
            setData(undefined)
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