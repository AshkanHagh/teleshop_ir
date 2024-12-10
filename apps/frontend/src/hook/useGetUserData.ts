import { useCallback, useEffect, useState } from "react"
import { useAuthContext } from "../context/AuthContext"
import { AxiosError } from "axios"
import { ResponseError, UserValidation } from "../types/types"
import { useLocation } from "react-router-dom"
import axiosInstance from "../api/axios"

const useGetUserData = (excludePaths: string[] = []) => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>()
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
            const { data } = await axiosInstance.post<UserValidation>('auth/pol-barzakh', { initData: 'user=%7B%22id%22%3A1043807305%2C%22first_name%22%3A%22Shahin%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Shahinfallah2006%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FLpG4sl8IJHB_cgQSD-3JWh7TErOUwonxNJwormB8LRg.svg%22%7D&chat_instance=-1013546540309642850&chat_type=private&auth_date=1733055853&signature=Ta0HRfUGyeVBV_dyP68fibBXqL1aEgGEAUiwEyHne6wNfPZdEMvuauVOVxgSaIRIFeZjKmqHUKDmZb--3kcGDA&hash=2098c493e6ef6d231d67dfed5f69af700765018b5ae15ee09e53f537b4fbdc78' })
            updateAuthState(data)
            setError(undefined)

        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setError(error.response?.data.message || 'لطفا اینترنت خود را برسی کرده و دوباره امتحان کنید')
        } finally {
            setIsLoading(false)
        }
    }, [axiosInstance, updateAuthState, tg.initData])

    useEffect(() => {
        fetchUserData()
    }, [])

    return { isLoading, error, fetchUserData }
}

export default useGetUserData