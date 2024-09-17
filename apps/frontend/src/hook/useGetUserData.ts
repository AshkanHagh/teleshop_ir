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
            const { data } = await axios.post<UserValidation>('auth/pol-barzakh', { initialData: 'user=%7B%22id%22%3A1043807305%2C%22first_name%22%3A%22Shahin%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Shahinfallah2006%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&chat_instance=67077152179764008&chat_type=private&auth_date=1726197234&hash=2cc1e9b6db187c4d4662a041c290f6a735bfa77467761b80ec2b57279d4442a2' })
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