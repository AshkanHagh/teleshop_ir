import { History, LayoutList, ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"

type MenuItemVariant = "admin-panel" | "history" | "services"

type MenuItemProps = {
  variant: MenuItemVariant
  text: string
  to: string
}

const MenuItem: React.FC<MenuItemProps> = ({ variant, text, to = "#" }) => {
  const checkVariant = (variant: MenuItemVariant) => {
    switch (variant) {
      case "admin-panel":
        return <ShieldAlert size="17" />
      case "history":
        return <History size="17" />
      case "services":
        return <LayoutList size="17" />
    }
  }

  return (
    <Link
      to={to}
      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
    >
      {checkVariant(variant)}
      <span className="mr-1 mb-1">{text}</span>
    </Link>
  )
}

export default MenuItem
