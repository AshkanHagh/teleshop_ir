import { useCallback, useEffect, useState } from "react"
import useAxios from "./useAxios"
import { useAuthContext } from "../context/AuthContext"
import { AxiosError } from "axios"
import { ResponseError, UserValidation } from "../types/types"

const useGetUserData = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>()

    const axios = useAxios()
    const { updateAuthState } = useAuthContext()

    const tg = window.Telegram.WebApp

    const fetchUserData = useCallback(async () => {
        setIsLoading(true)
        try {
            const { data } = await axios.post<UserValidation>('auth/pol-barzakh', { initialData: tg.initData })
            updateAuthState(data)
            setError(undefined)

        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setError(error.response?.data.message || 'لطفا اینترنت خود را برسی کرده و دوباره امتحان کنید')
        } finally {
            setIsLoading(false)
        }
    }, [axios, updateAuthState, tg.initData])

    useEffect(() => {
        fetchUserData()
    }, [])

    return { isLoading, error, fetchUserData }
}

export default useGetUserData