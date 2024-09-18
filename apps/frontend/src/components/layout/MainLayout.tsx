import { ReactNode, useEffect } from "react"
import LoadingScreen from "../LoadingScreen/LoadingScreen"
import TryAgainModal from "../ui/TryAgainModal"
import useGetUserData from "../../hook/useGetUserData"
import { AnimatePresence } from "framer-motion"

type MainLayoutProps = {
    children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const tg = Telegram.WebApp
    const { isLoading, error, fetchUserData } = useGetUserData()

    useEffect(() => {
        tg.ready()
    }, [])

    if (isLoading) return <LoadingScreen />
    if (error) return <TryAgainModal onRetry={fetchUserData} message={error} />

    return (
        <>
            <AnimatePresence mode="wait">
                {children}
            </AnimatePresence>
        </>
    )
}

export default MainLayout
