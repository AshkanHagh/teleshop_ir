import { useState } from "react"
import Button from "../../components/ui/Button"
import { statusContent } from "./statusContent"
import { twMerge } from "tailwind-merge"
import useVerifyPayment from "../../hook/useVerifyPayment"
import { useSearchParams } from "react-router-dom"
import { redirect } from "react-router"

export type Statuses = "loading" | "success" | "failure"

type Queries = { Authority?: string; Status?: string }

const PaymentVerifyPage: React.FC = () => {
  const [status, setStatus] = useState<Statuses>("loading")
  const [searchParams] = useSearchParams()

  const queries: Queries = Object.fromEntries(searchParams.entries())
  const { errorMessage } = useVerifyPayment(setStatus, {
    Authority: queries.Authority,
    Status: queries.Status
  })

  const {
    icon: Icon,
    iconClass,
    description,
    title,
    hasButton,
    buttonClass
  } = statusContent[status]

  const handleButtonClick = () => {
    redirect("https://t.me/teleshop_ir_bot/teleshop_ir")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          {Icon && <Icon className={iconClass} />}
          <h2 className="mt-4 text-xl font-semibold text-gray-700">{title}</h2>
          <p className="my-2 text-gray-600">{description || errorMessage}</p>
          {status === "success" && (
            <p className="text-gray-400 text-sm border-t">
              برای مشاهده سفارش، به بخش
              <span className="text-gray-600 font-semibold">
                {" "}
                "سفارش‌های من"{" "}
              </span>
              بروید.
            </p>
          )}

          {hasButton && (
            <Button
              onClick={handleButtonClick}
              className={twMerge("mt-6 rounded-full", buttonClass)}
            >
              برگشت به برنامه
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentVerifyPage
