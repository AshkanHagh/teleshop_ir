import { ButtonHTMLAttributes } from "react"
import { twMerge } from 'tailwind-merge'

type ButtonProps = {
    text: string
} & ButtonHTMLAttributes<HTMLButtonElement>

const Button: React.FC<ButtonProps> = ({
    text,
    onClick,
    className,
    type = 'button', disabled }) => {
    return (
        <button
            disabled={disabled}
            type={type}
            onClick={onClick}
            className={twMerge("mt-4 bg-blue-500 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-600 transition w-full disabled:opacity-70 disabled:hover:bg-blue-500", className)}>
            {text}
        </button>
    )
}

export default Button