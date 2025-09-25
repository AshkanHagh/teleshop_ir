import { useSpring } from "framer-motion"
import { useEffect, useState } from "react"

const useAnimateNumbers = (initialValue: number) => {
  const [number, setNumber] = useState<number>(initialValue)
  const spring = useSpring(initialValue, {
    bounce: 0,
    duration: 1000
  })
  useEffect(() => {
    spring.on("change", (value) => {
      setNumber(Math.round(value))
    })

    return () => {
      spring.destroy()
    }
  }, [])

  return [number, spring] as [number, typeof spring]
}

export default useAnimateNumbers
