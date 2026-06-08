import React from "react"
import { motion } from "framer-motion"

type ContentAnimationWrapperProps = {
  children: React.ReactNode
  className?: string
  duration?: number
}

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const ContentAnimationWrapper: React.FC<ContentAnimationWrapperProps> = ({
  children,
  className,
  duration = 0.5
}) => {
  return (
    <motion.div
      className={className}
      variants={contentVariants}
      initial={"hidden"}
      animate={"visible"}
      exit={"exit"}
      transition={{ duration, delay: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

export default ContentAnimationWrapper
