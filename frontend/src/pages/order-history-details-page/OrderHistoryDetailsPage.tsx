import Container from "../../components/layout/Container"
import getOrderStatus from "../../utils/getOrderStatus"
import OrderHistoryDetailsSkeleton from "./OrderHistoryDetailsSkeleton"
import OrderHistoryDetailField from "./OrderHistoryDetailsField"
import { useParams } from "react-router-dom"
import { useMemo } from "react"
import useGetOrderDetails from "../../hook/useGetOrderDetails"
import formatOrderTime from "../../utils/formatOrderTime"
import SkeletonAnimationWrapper from "../../components/animation/SkeletonAnimationWrapper"
import TryAgainModal from "../../components/ui/TryAgainModal"
import { AnimatePresence } from "framer-motion"
import ContentAnimationWrapper from "../../components/animation/ContentAnimationWrapper"

const OrderHistoryDetailPage = () => {
  const { orderId } = useParams()
  const [refetch, { data: order, error, isLoading }] = useGetOrderDetails(
    `/dashboard/history`,
    orderId
  )

  const orderFields = useMemo(
    () =>
      Object.entries({
        "شماره سفارش": order?.transactionId,
        "نام کاربری": order?.username,
        "نام سرویس": order?.service.serviceName,
        "قیمت(TON)": order?.service.ton,
        "قیمت(Toman)": order?.service.irr.toLocaleString("en-IR"),
        "تاریخ پرداخت": order?.orderPlaced
          ? formatOrderTime(order?.orderPlaced)
          : "ناموجود"
      }),
    [order]
  )

  const {
    icon: StatusIcon,
    color,
    bgColor,
    text: statusText
  } = getOrderStatus(order ? order.status : null)

  const renderContent = () => {
    if (isLoading) {
      return (
        <SkeletonAnimationWrapper key="order-details-skeleton">
          <OrderHistoryDetailsSkeleton />
        </SkeletonAnimationWrapper>
      )
    }

    if (error) {
      return (
        <TryAgainModal
          onRetry={refetch}
          message={error.response?.data.message}
        />
      )
    }

    if (!order) return

    return (
      <ContentAnimationWrapper key="order-details">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="space-y-4">
            {orderFields.map(([fieldName, value]) => (
              <OrderHistoryDetailField key={fieldName} fieldName={fieldName}>
                {value}
              </OrderHistoryDetailField>
            ))}

            <div className="border-t border-gray-200 my-4"></div>

            <OrderHistoryDetailField fieldName="وضعیت سفارش">
              <div
                className={`flex items-center ${color} ${bgColor} px-3 py-1 rounded-full gap-1`}
              >
                {StatusIcon && <StatusIcon size="17" />}
                <span className="text-sm font-medium mb-1">{statusText}</span>
              </div>
            </OrderHistoryDetailField>
          </div>
        </div>
      </ContentAnimationWrapper>
    )
  }
  return (
    <Container title="جزعیات سفارش">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </Container>
  )
}

export default OrderHistoryDetailPage
