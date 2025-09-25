import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Star as StarIcon
} from "lucide-react"
import Button from "../../components/ui/Button"
import { useStarContext } from "../../context/StarContext"

const StarsSelectorBox: React.FC = () => {
  const {
    decrementStars,
    incrementStars,
    fetchStars,
    isLoading,
    starCount,
    starIndex,
    stars,
    error
  } = useStarContext()

  const isUnavailable = isLoading || error !== null

  return (
    <div className="bg-blue-50 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          disabled={starIndex === stars.length - 1 || isUnavailable}
          onClick={incrementStars}
          className="bg-blue-500 text-white p-2 rounded-full w-fit "
          aria-label="Decrease stars"
        >
          <ChevronRight size={24} />
        </Button>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">
            {isLoading ? (
              <LoaderCircle className="animate-spin size-7 inline" />
            ) : error ? (
              <button
                className="text-sm p-1.5 px-2 underline text-red-600"
                onClick={fetchStars}
              >
                تلاش مجدد
              </button>
            ) : (
              starCount
            )}
          </div>
          <div className="text-sm text-gray-600">Stars</div>
        </div>
        <Button
          disabled={starIndex === 0 || isUnavailable}
          onClick={decrementStars}
          className="bg-blue-500 text-white p-2 rounded-full w-fit "
          aria-label="Increase stars"
        >
          <ChevronLeft size={24} />
        </Button>
      </div>
      <div className="flex justify-center">
        {[...Array(5)].map((_, index) => (
          <StarIcon
            key={index}
            className="w-6 h-6 text-yellow-400 fill-current"
          />
        ))}
      </div>
    </div>
  )
}
export default StarsSelectorBox
