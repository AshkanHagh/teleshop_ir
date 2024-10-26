import { AxiosError } from "axios"
import { ResponseError } from "../../types/types"
import { AnimatePresence } from "framer-motion"
import ContentAnimationWrapper from "../animation/ContentAnimationWrapper"
import TryAgainModal from "../ui/TryAgainModal"
import SkeletonAnimationWrapper from "../animation/SkeletonAnimationWrapper"

type InfiniteDataLoaderProps = {
    children: React.ReactNode,
    dataFetcher: () => void
    data: Array<unknown>
    isLoading: boolean
    error: AxiosError<ResponseError> | undefined
    isInitialLoading: boolean
    loadingElement: React.ReactNode
    showInfiniteLoader: boolean
    emptyData: React.ReactNode
}

const InfiniteDataLoader: React.FC<InfiniteDataLoaderProps> = ({
    dataFetcher: refetch,
    emptyData,
    data,
    error,
    isLoading,
    loadingElement,
    isInitialLoading,
    showInfiniteLoader,
    children,
}) => {

    return (
        <>
            <AnimatePresence mode="wait">
                {isInitialLoading && (
                    <SkeletonAnimationWrapper key='initial-skeleton'>
                        {loadingElement}
                    </SkeletonAnimationWrapper>
                )}
                {!isInitialLoading && data.length > 0 && (
                    <ContentAnimationWrapper key='skeleton-loader'>
                        {children}
                    </ContentAnimationWrapper>
                )}
                {!isLoading && !isInitialLoading && data.length === 0 && !error && (
                    <ContentAnimationWrapper key="no-orders">
                        {emptyData}
                    </ContentAnimationWrapper>
                )}
                {error && !isInitialLoading && (
                    <TryAgainModal message={error.response?.data.message} onRetry={refetch} />
                )}
            </AnimatePresence>
            {showInfiniteLoader && (
                loadingElement
            )}
        </>
    )
}
export default InfiniteDataLoader