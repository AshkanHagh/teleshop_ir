import { ReactNode, useEffect } from "react"
import LoadingScreen from "../LoadingScreen/LoadingScreen"
import TryAgainModal from "../ui/TryAgainModal"
import useGetUserData from "../../hook/useGetUserData"
import { AnimatePresence } from "framer-motion"
import useBackButton from "../../hook/useBackButton"

type MainLayoutProps = {
    children: ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const tg = Telegram.WebApp
    const { isLoading, error, fetchUserData } = useGetUserData(['/payment-verify'])

    useBackButton()

    useEffect(() => {
        tg.ready()
    }, [])

    if (isLoading) return (
        <AnimatePresence>
            <LoadingScreen />
        </AnimatePresence>
    )
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
