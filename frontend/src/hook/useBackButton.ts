import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const useBackButton = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const tg = Telegram.WebApp

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType("navigation")

    if (
      navigationEntries.length > 0 &&
      // @ts-ignore: TS cannot infer the exact type of navigationEntries
      navigationEntries[0].type === "reload"
    ) {
      // On browser reload → force navigate to home ("/")
      location.pathname !== "/" && navigate("/")
    }
  }, [])

  useEffect(() => {
    const handleBackButtonClick = () => {
      location.key === "default" ? navigate("/") : navigate(-1)
    }

    if (location.pathname === "/") {
      tg.BackButton.hide()
      return
    }

    tg.BackButton.show()
    // Reset old click handler before attaching a new one
    tg.BackButton.offClick(handleBackButtonClick)
    tg.BackButton.onClick(handleBackButtonClick)

    return () => {
      // Cleanup → hide and remove handler when component unmounts or deps change
      tg.BackButton.hide()
      tg.BackButton.offClick(handleBackButtonClick)
    }
  }, [location.pathname, location.key])
}

export default useBackButton
