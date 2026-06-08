import { ButtonHTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className,
  type = "button",
  disabled
}) => {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={twMerge(
        "mt-4 bg-blue-500 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-600 transition w-full disabled:opacity-70",
        className
      )}
    >
      {children}
    </button>
  )
}

export default Button
