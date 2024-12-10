import { createContext, useCallback, useContext, useEffect, useState } from "react"
import useGetServiceOptions from "../hook/useGetServiceOptions"
import { ResponseError, SocketData, Star } from "../types/types"
import { AxiosError } from "axios"
import useAnimateNumbers from "../hook/useAnimateNumber"
import { toast } from "sonner"
import useSocket from "../hook/useSocket"

type StarContext = {
    starIndex: number
    starCount: number
    stars: Star[]
    currentStar: Star | null
    isLoading: boolean
    error: AxiosError<ResponseError> | null,
    irrPrice: number,
    tonQuantity: number
    incrementStars: () => void
    decrementStars: () => void
    fetchStars: () => Promise<void>
}

const StarContextInitData: StarContext = {
    starIndex: 0,
    starCount: 50,
    stars: [],
    isLoading: false,
    currentStar: null,
    error: null,
    irrPrice: 0,
    tonQuantity: 0,
    incrementStars: () => { },
    decrementStars: () => { },
    fetchStars: async () => { }
}

const StarContext = createContext<StarContext>(StarContextInitData)

export const StarContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [starIndex, setStarIndex] = useState<number>(0)
    const [fetchStars, { data, error, isLoading, setData }] = useGetServiceOptions<Star[]>('star')

    const [starCount, starCountSpring] = useAnimateNumbers(0)
    const [irrPrice, irrPriceSpring] = useAnimateNumbers(0)
    const [tonQuantity, tonQuantitySpring] = useAnimateNumbers(0)

    const stars = data?.service ?? []
    const currentStar = stars[starIndex]

    // Socket error
    const handleSocketError = useCallback(() => toast.error('خطا در بروزرسانی قیمت!'), [])

    // Update stars price 
    const handleSocketMessage = useCallback((message: MessageEvent<string>) => {
        const socketData: SocketData = JSON.parse(message.data)
        if (socketData.type !== 'updated-star-prices') return;

        const newPrices = Object.fromEntries(
            socketData.data.map(price => [
                price.id,
                {
                    totalTonAmount: price.totalTonAmount,
                    totalTonPriceInIrr: price.totalTonPriceInIrr,
                }
            ])
        );

        setData(prev => {
            if (!prev) return undefined
            const updatedService: Star[] = prev.service.map(star => {
                const priceData = newPrices[star.id]
                if (!priceData) return star

                return {
                    ...star,
                    irrPrice: priceData.totalTonPriceInIrr + Math.floor(Math.random() * 10),
                    tonQuantity: priceData.totalTonAmount,
                }
            })
            return { ...prev, service: updatedService }
        })
    }, [setData])

    useSocket(handleSocketMessage, handleSocketError)

    const incrementStars = useCallback(() => {
        if (!stars) return

        setStarIndex(prev => {
            if (prev < stars.length - 1) {
                return prev + 1
            }
            return prev
        })
    }, [stars])
    const decrementStars = useCallback(() => {
        if (!stars) return

        setStarIndex(prev => {
            if (prev > 0) {
                return prev - 1
            }
            return prev
        })
    }, [stars])

    useEffect(() => {
        if (!data) return

        starCountSpring.set(+currentStar.stars)
        irrPriceSpring.set(currentStar.irr)
        tonQuantitySpring.set(currentStar.ton)

    }, [data, starIndex, isLoading])

    const value: StarContext = {
        starIndex,
        starCount,
        stars,
        isLoading,
        error,
        currentStar,
        irrPrice,
        tonQuantity,
        decrementStars,
        incrementStars,
        fetchStars
    }

    return <StarContext.Provider value={value}>
        {children}
    </StarContext.Provider>
}

export const useStarContext = (): StarContext => {
    return useContext(StarContext)
} 