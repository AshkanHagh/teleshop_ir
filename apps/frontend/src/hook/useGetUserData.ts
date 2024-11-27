import { useCallback, useEffect, useState } from "react"
import useAxios from "./useAxios"
import { useAuthContext } from "../context/AuthContext"
import { AxiosError } from "axios"
import { ResponseError, UserValidation } from "../types/types"
import { useLocation } from "react-router-dom"

const useGetUserData = (excludePaths: string[] = []) => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>()
    const axios = useAxios()
    const { updateAuthState } = useAuthContext()
    const { pathname: currentPath } = useLocation()

    const tg = Telegram.WebApp

    const fetchUserData = useCallback(async () => {
        // Check for exclude paths
        if (excludePaths.includes(currentPath)) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        try {
            const { data } = await axios.post<UserValidation>('auth/pol-barzakh', { initData: 'user=%7B%22id%22%3A1043807305%2C%22first_name%22%3A%22Shahin%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Shahinfallah2006%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=67077152179764008&chat_type=private&auth_date=1726391905&hash=13373ce90482d5646cecb00d4e5d6de93853ff36fdf7b0665dce1475375693c9' })
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