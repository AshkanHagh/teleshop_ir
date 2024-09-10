import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { OptionsParams } from "../types/types"

const useGetServiceOptions = <T, E = { success: boolean, message: string }>(endpoint: string) => {
  const [data, setData] = useState<T>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<E>()
  const { serviceId } = useParams<OptionsParams>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (serviceId) {
          const res = await fetch(`https://jsonplaceholder.typicode.com/users`)
          const resData: T = await res.json()
          setData(resData)
        }

      } catch (err) {
        const error = err as E
        setError(error)
      } finally {
        setIsLoading(false)
      }


    }
    fetchData()
  }, [])

  return { data, isLoading, error }
}

export default useGetServiceOptions