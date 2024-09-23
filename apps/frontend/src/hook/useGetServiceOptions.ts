import { useEffect, useState } from "react"
import axiosInstance from "../api/axios"
import { AxiosError, AxiosResponse } from "axios"
import { ResponseError } from "../types/types"

type ServiceOptionDetail<U> = {
    isLoading: boolean,
    data: AxiosResponse<U> | undefined,
    error: AxiosError<ResponseError> | undefined
}

type UseGetServiceOptionsReturnType<U> = [
    () => void,
    ServiceOptionDetail<U>
]

const useGetServiceOptions = <T>(params: string): UseGetServiceOptionsReturnType<T> => {
    const [data, setData] = useState<AxiosResponse<T>>()
    const [error, setError] = useState<AxiosError<ResponseError>>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchOptions = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get<T>(`services/service?service=${params}`)
            setData(response)
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
        fetchOptions()
    }, [])

    return [fetchOptions, { isLoading, data, error }]
}

export default useGetServiceOptions