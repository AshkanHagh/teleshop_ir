import { useState } from 'react'
import Container from '../../components/layout/Container'
import OrderItem from './OrderHistoryItem'
import OrderHistoryItemSkeleton from './OrderHistoryItemSkeleton'
import NoOrders from '../../components/ui/NoOrder'
import useInfinityScroll from '../../hook/useInfinityScroll'
import { HandleSelectChange, OrderHistory, SelectOption } from '../../types/types'
import Select from '../../components/ui/Select'
import InfiniteDataLoader from '../../components/data/InfiniteDataLoader'

const OrderHistoryPage: React.FC = () => {
  const [filter, setFilter] = useState<SelectOption>({ label: 'همه', value: 'all' })

  const {
    data,
    error,
    isLoading,
    showInfiniteLoader,
    isInitialLoading,
    setHasMore,
    setOffset,
    setData,
    setIsInitialLoading,
    fetchData: refetch
  } = useInfinityScroll<OrderHistory>({
    endpoint: `dashboard/history?filter=${filter.value}`,
    limit: 10,
    fetchPosition: 250,
    dataKey: 'orders'
  })

  const orderFilterOptions: SelectOption[] = [
    { value: 'all', label: 'همه', isInitValue: true },
    { value: 'pending', label: 'در انتظار' },
    { value: 'in_progress', label: 'در حال انجام' },
    { value: 'completed', label: 'تکمیل شده' },
  ]

  const handleSelectChange: HandleSelectChange = (selectOption: SelectOption, stopChangeOption) => {
    if (isLoading) return stopChangeOption()

    setHasMore(true)
    setOffset(0)
    setData([])
    setFilter(selectOption)
    setIsInitialLoading(true)
  }

  return (
    <Container title="سفارش های من">
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
        {data.map(order => (
          <OrderItem
            key={order.id}
            id={order.id}
            serviceName={order.serviceName}
            orderPlaced={order.orderPlaced}
            status={order.status}
          />
        ))}
      </InfiniteDataLoader>

    </Container>
  )
}


const SKELETON_COUNT = 4

const SkeletonLoader: React.FC = () => (
  Array.from({ length: SKELETON_COUNT }, (_, index) => (
    <OrderHistoryItemSkeleton key={index} />
  ))
)

export default OrderHistoryPage