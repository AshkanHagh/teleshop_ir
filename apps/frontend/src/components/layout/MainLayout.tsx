import { ReactNode, useEffect } from "react"
import LoadingScreen from "../LoadingScreen/LoadingScreen"
import TryAgainModal from "../ui/TryAgainModal"
import useGetUserData from "../../hook/useGetUserData"

type MainLayoutProps = {
    children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const tg = window.Telegram.WebApp
    const { isLoading, error, fetchUserData } = useGetUserData()

    useEffect(() => {
        tg.ready()
    }, [])

    if (isLoading) return <LoadingScreen />
    if (error) return <TryAgainModal onRetry={fetchUserData} message={error} />

    return (
        <>
            {children}
        </>
    )
}

export default MainLayout
