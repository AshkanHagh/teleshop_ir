import { useEffect, useState } from "react"
import { AxiosError } from "axios"
import { ResponseError } from "../types/types"
import useAxios from "./useAxios"

type ServiceOptionDetail<U> = {
    isLoading: boolean,
    data: ResponseType<U> | undefined,
    error: AxiosError<ResponseError> | null
    setData: React.Dispatch<React.SetStateAction<ResponseType<U> | undefined>>

}

type UseGetServiceOptionsReturnType<U> = [
    () => Promise<void>,
    ServiceOptionDetail<U>
]

type ResponseType<T> = {
    success: boolean,
    service: T
}

const useGetServiceOptions = <T>(params: string): UseGetServiceOptionsReturnType<T> => {
    const [data, setData] = useState<ResponseType<T>>()
    const [error, setError] = useState<AxiosError<ResponseError> | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const axios = useAxios()

    const fetchOptions = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get<ResponseType<T>>(`services/detail?filter=${params}`)
            const data = response.data
            setData(data)
            setError(null)
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

    return [fetchOptions, { isLoading, data, error, setData }]
}

export default useGetServiceOptions