import { useEffect, useState } from "react"
import useAxios from "./useAxios"
import { AxiosError } from "axios"
import { OrderResponseType, ResponseError } from "../types/types"

type UseInfinityScrollOptions = {
  endpoint: string
  limit: number
  dataKey: string
  fetchPosition?: number
}

const useInfinityScroll = <T>({
  endpoint,
  limit,
  dataKey,
  fetchPosition = 3
}: UseInfinityScrollOptions) => {
  const [data, setData] = useState<T[]>([])
  const [error, setError] = useState<AxiosError<ResponseError> | undefined>()
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [offset, setOffset] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true)
  const [showInfiniteLoader, setShowInfiniteLoader] = useState<boolean>(false)
  const axios = useAxios()
  let fetching = false

  // Core function to load next batch of data
  const fetchData = async () => {
    if (!hasMore || fetching) return // prevent unnecessary requests

    fetching = true
    setIsLoading(true)
    try {
      setError(undefined)
      const response = await axios.get<OrderResponseType<T[], typeof dataKey>>(
        endpoint,
        {
          params: { offset, limit }
        }
      )
      // Append new data
      setData((prev) => [...prev, ...response.data[dataKey]])
      setOffset((prev) => prev + limit)
      setHasMore(response.data.next)
    } catch (e) {
      const error = e as AxiosError<ResponseError>
      setError(error)
    } finally {
      setIsLoading(false)
      fetching = false
    }
  }

  // Detect when user scrolls near the bottom of the page
  const handleScroll = () => {
    const isEndOfPage =
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.scrollHeight - fetchPosition
    if (isEndOfPage && !isLoading && hasMore && !error) {
      fetchData()
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isLoading, hasMore, error])

  useEffect(() => {
    fetchData()
  }, [endpoint])

  useEffect(() => {
    // Mark initial loading as finished after first request
    if (!isLoading) {
      setIsInitialLoading(false)
    }
  }, [isLoading])

  useEffect(() => {
    let timer: number
    // Delay showing infinite loader for smoother UX
    if (!isInitialLoading && hasMore) {
      timer = setTimeout(() => {
        setShowInfiniteLoader(true)
      }, 500)
    } else {
      setShowInfiniteLoader(false)
    }
    return () => clearTimeout(timer)
  }, [isInitialLoading, hasMore])

  return {
    data,
    error,
    isLoading,
    isInitialLoading,
    showInfiniteLoader,
    setIsInitialLoading,
    setHasMore,
    fetchData,
    setOffset,
    setData
  }
}

export default useInfinityScroll
