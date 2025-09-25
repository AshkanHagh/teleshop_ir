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
      const { data } = await axiosInstance.post<UserValidation>(
        "auth/pol-barzakh",
        { initData: tg.initData }
      )
      updateAuthState(data)
      setError(undefined)
    } catch (e) {
      const error = e as AxiosError<ResponseError>
      setError(
        error.response?.data.message ||
          "لطفا اینترنت خود را برسی کرده و دوباره امتحان کنید"
      )
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
