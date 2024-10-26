import { useState } from 'react'
import Container from '../../components/layout/Container'
import { HandleSelectChange, ManageOrder, SelectOption } from '../../types/types'
import OrderItem from './ManageOrderItem'
import ManageOrderItemSkeleton from './ManageOrderItemSkeleton'
import NoOrders from '../../components/ui/NoOrder'
import Select from '../../components/ui/Select'
import useInfinityScroll from '../../hook/useInfinityScroll'
import InfiniteDataLoader from '../../components/data/InfiniteDataLoader'

const ManageOrdersPage = () => {
    const [filter, setFilter] = useState<SelectOption>({ value: 'all', label: 'همه' })
    
    const {
        data,
        error,
        isLoading,
        isInitialLoading,
        showInfiniteLoader,
        setData,
        setHasMore,
        setIsInitialLoading,
        setOffset,
        fetchData: refetch
    } = useInfinityScroll<ManageOrder>({
        endpoint: `dashboard/admin?filter=${filter?.value}`,
        limit: 10,
        dataKey: 'service',
        fetchPosition: 250
    })

    const handleSelectChange: HandleSelectChange = (selectOption: SelectOption, stopChangeOption) => {
        if (isLoading) return stopChangeOption()

        setHasMore(true)
        setOffset(0)
        setData([])
        setFilter(selectOption)
        setIsInitialLoading(true)
    }

    const orderFilterOptions: SelectOption[] = [
        { value: 'all', label: 'همه', isInitValue: true },
        { value: 'pending', label: 'در انتظار' },
        { value: 'in_progress', label: 'در حال انجام' },
        { value: 'completed', label: 'تکمیل شده' },
    ]

    return (
        <Container title="مدریت سفارش ها">
            <Select handleChange={handleSelectChange} options={orderFilterOptions} />
            <InfiniteDataLoader
                data={data}
                dataFetcher={refetch}
                emptyData={<NoOrders />}
                error={error}
                isInitialLoading={isInitialLoading}
                isLoading={isLoading}
                showInfiniteLoader={showInfiniteLoader}
                loadingElement={<SkeletonLoader />}
            >
                <ul>
                    {data.map(order => (
                        <OrderItem
                            key={order.id}
                            order={order}
                        />
                    ))}
                </ul>
            </InfiniteDataLoader>

        </Container>
    )
}

const SKELETON_COUNT = 4

const SkeletonLoader: React.FC = () => (
    Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <ManageOrderItemSkeleton key={index} />
    ))
)

export default ManageOrdersPage