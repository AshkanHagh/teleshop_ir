import { AxiosError, AxiosResponse } from "axios"
import { useState } from "react"
import { ResponseError } from "../types/types"

const useGetManageOrder = () => {
    const [data, setData] = useState<AxiosResponse>()
    const [error, setError] = useState<AxiosError<ResponseError>>()
    const [isLoading, setIsLoading] = useState<boolean>()

    const fetchManageOrder = async () => {
        try {
            setIsLoading(true)
            // api call

        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setError(error)
        } finally {
            setIsLoading(false)
        }
    }

}

export default useGetManageOrder