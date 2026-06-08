import Container from "../../components/layout/Container"
import { StarContextProvider } from "../../context/StarContext"
import TGStarsContent from "./StarsContent"

const TGStarsPage = () => {
  return (
    <Container>
      <StarContextProvider>
        <TGStarsContent />
      </StarContextProvider>
    </Container>
  )
}
export default TGStarsPage
