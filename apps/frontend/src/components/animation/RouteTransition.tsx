import React from "react"
import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"

interface RouteTransitionProps {
  children: React.ReactNode
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -10
  }
}

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
}

const RouteTransition = ({ children }: RouteTransitionProps) => {
  const location = useLocation()

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

export default RouteTransition
