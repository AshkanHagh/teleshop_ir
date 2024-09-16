import { ReactNode, useEffect, useState, useCallback } from "react"
import useAxios from "../../hook/useAxios"
import { AxiosError } from "axios"
import { ResponseError, UserValidation } from "../../types/types"
import LoadingScreen from "../LoadingScreen/LoadingScreen"
import { useAuthContext } from "../../context/AuthContext"
import { useErrorContext } from "../../context/ErrorContext"
import TryAgainModal from "../ui/TryAgainModal"

type MainLayoutProps = {
    children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const axios = useAxios()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { updateAuthState } = useAuthContext()
    const { setRetryError } = useErrorContext()
    const tg = window.Telegram.WebApp

    const fetchUserData = useCallback(async () => {
        setIsLoading(true)
        try {
            console.log(tg.initDataUnsafe)
            const { data } = await axios.post<UserValidation>('auth/pol-barzakh', { initialData: tg.initData })
            updateAuthState(data)

        } catch (e) {
            const error = e as AxiosError<ResponseError>
            setRetryError(error.response?.data.message, fetchUserData)
        } finally {
            setIsLoading(false)
        }
    }, [axios, updateAuthState, tg.initData])


    useEffect(() => {
        tg.ready()
        fetchUserData()
    }, [])

    if (isLoading) return <LoadingScreen />

    return (
        <>
            {children}
            <TryAgainModal />
        </>
    )
}

export default MainLayout
