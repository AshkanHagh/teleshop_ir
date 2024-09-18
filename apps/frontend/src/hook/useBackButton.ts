import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const useBackButton = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const tg = Telegram.WebApp

        tg.BackButton.show()
        tg.BackButton.onClick(() => {
            navigate(-1)
        })

        return () => {
            tg.BackButton.hide()
        }
    }, [])
}

export default useBackButton