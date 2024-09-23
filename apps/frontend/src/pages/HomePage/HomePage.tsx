import ServiceCard from "./ServiceCard"
import ServiceCardSkeleton from "./ServiceCardSkeleton"
import Container from "../../components/layout/Container"
import useGetServices from "../../hook/useGetServices"
import TryAgainModal from "../../components/ui/TryAgainModal"
import { AnimatePresence } from "framer-motion"
import SkeletonAnimationWrapper from "../../components/animation/SkeletonAnimationWrapper"
import ContentAnimationWrapper from "../../components/animation/ContentAnimationWrapper"

const SKELETON_COUNT = 3

const Home = () => {
    const [refetch, { data: response, isLoading, error }] = useGetServices()

    const renderContent = () => {
        if (isLoading) {
            return (
                <SkeletonAnimationWrapper key='skeleton' className="grid grid-cols-1 gap-4">
                    {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                        <ServiceCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </SkeletonAnimationWrapper>
            )
        }

        if (error) {
            const errorMessage = error.response?.data.message
            return (
                <TryAgainModal onRetry={refetch} message={errorMessage} />
            )
        }

        if (response?.data.success && response.data.services) {
            return (
                <ContentAnimationWrapper key='content' className="grid grid-cols-1 gap-4">
                    {response.data.services.map(card => (
                        <ServiceCard
                            key={card.id}
                            route={card.route}
                            title={card.title}
                            description={card.description}
                        />
                    ))}
                </ContentAnimationWrapper>
            )
        }

        return null
    }

    return (
        <Container title="سرویس ها">
            <AnimatePresence mode="wait">
                {renderContent()}
            </AnimatePresence>
        </Container >
    )
}

export default Home