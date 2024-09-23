import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const useBackButton = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const tg = Telegram.WebApp

    useEffect(() => {
        if (location.pathname === '/') {
            tg.BackButton.hide()
            return
        }
        
        tg.BackButton.show()
        tg.BackButton.onClick(() => {
            navigate(-1)
        })

        return () => {
            tg.BackButton.hide()
        }
    }, [location.pathname])
}

export default useBackButton