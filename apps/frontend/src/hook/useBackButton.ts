import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const useBackButton = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const tg = Telegram.WebApp

    useEffect(() => {
        location.pathname !== '/' && navigate('/')
    }, [])


    useEffect(() => {
        const handleBackButtonClick = () => {
            location.key === 'default' ? navigate('/') : navigate(-1)
        }

        if (location.pathname === '/') {
            tg.BackButton.hide()
            return
        }

        tg.BackButton.show()
        tg.BackButton.offClick(handleBackButtonClick)
        tg.BackButton.onClick(handleBackButtonClick)

        return () => {
            tg.BackButton.hide()
            tg.BackButton.offClick(handleBackButtonClick)
        }
    }, [location.pathname, location.key])
}

export default useBackButton