import React from 'react'
import { motion } from 'framer-motion'

type SkeletonAnimationWrapperProps = {
  children: React.ReactNode,
  className?: string,
  duration?: number
}

const skeletonVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const SkeletonAnimationWrapper: React.FC<SkeletonAnimationWrapperProps> = ({ children, duration, className }) => {
  return (
    <motion.div
      className={className}
      variants={skeletonVariants}
      initial={'hidden'}
      animate={'visible'}
      exit={'exit'}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  )
}

export default SkeletonAnimationWrapper