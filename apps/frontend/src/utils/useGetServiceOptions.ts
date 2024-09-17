import { useEffect, useState } from "react"
import axiosInstance from "../api/axios"
import { AxiosError } from "axios"
import { ResponseError } from "../types/types"

const useGetServiceOptions = <T>(params: string) => {
    const [data, setData] = useState<T>()
    const [error, setError] = useState<AxiosError<ResponseError>>()
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const fetchOptions = async () => {
        try {
            const response = await axiosInstance.get<T>(`auth/services?q=${params}`)
            setData(response.data)
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