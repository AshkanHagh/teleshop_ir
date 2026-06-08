import { LoaderCircle } from "lucide-react"
import { useStarContext } from "../../context/StarContext"

const TotalPriceCard = () => {
  const { isLoading, error, fetchStars, irrPrice, tonQuantity } =
    useStarContext()

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mt-2">
        <span className="text-gray-700">قیمت کل:</span>
        <div className="text-left">
          {isLoading ? (
            <LoaderCircle className="my-2 animate-spin size-7 text-blue-500" />
          ) : error ? (
            <button
              className="text-sm p-1.5 px-2 underline text-red-600"
              onClick={fetchStars}
            >
              تلاش مجدد
            </button>
          ) : (
            <>
              <p className="text-xl font-bold text-blue-600">
                {tonQuantity} TON
              </p>
              <p className="text-sm text-gray-600">{irrPrice} ریال</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default TotalPriceCard
