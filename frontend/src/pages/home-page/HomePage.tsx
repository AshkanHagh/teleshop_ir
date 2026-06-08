import ServiceCard from "./ServiceCard"
import Container from "../../components/layout/Container"
import { AnimatePresence } from "framer-motion"
import ContentAnimationWrapper from "../../components/animation/ContentAnimationWrapper"
import { SERVICES } from "./SERVICES"

const Home = () => {
  return (
    <Container title="سرویس ها">
      <AnimatePresence mode="wait">
        <ContentAnimationWrapper
          key="content"
          className="grid grid-cols-1 gap-4"
        >
          {SERVICES.map((card) => (
            <ServiceCard
              key={card.id}
              route={card.route}
              title={card.title}
              description={card.description}
              icon={card.icon}
            />
          ))}
        </ContentAnimationWrapper>
      </AnimatePresence>
    </Container>
  )
}

export default Home
