import Container from "../layout/Container"
import style from "./loadingScreen.module.css"
import { motion } from "framer-motion"

const LoadingScreen = () => {
  return (
    <Container>
      <motion.div
        initial={{ top: 0 }}
        exit={{
          y: "100%",
          transition: {
            delay: 1,
            duration: 0.4,
            ease: "easeInOut"
          }
        }}
        className="fixed inset-0 z-10 flex items-center justify-center bg-white"
      >
        <div className={style.loader}></div>
      </motion.div>
    </Container>
  )
}

export default LoadingScreen
