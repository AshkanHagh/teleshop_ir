import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/homePage/HomePage";
import MainLayout from "./components/layout/MainLayout";
import TGPremiumOptionsPage from "./pages/tgPremiumOptionsPage/TGPremiumPage";
import TGStarsPage from "./pages/tgStarsPage/TGStarsPage";
import ManageOrderListPage from "./pages/manageOrdersPage/ManageOrdersPage";
import ManageOrderDetailsPage from "./pages/manageOrderDetailsPage/ManageOrderDetailsPage";
import OrderHistoryPage from "./pages/orderHistoryListPage/OrderHistoryPage";
import OrderHistoryDetailPage from "./pages/orderHistoryDetailsPage/OrderHistoryDetailsPage";
import RouteTransition from "./components/animation/RouteTransition";
import PrivateRoute from "./components/PrivateRoute";
import PaymentVerifyPage from "./pages/paymentVerify/PaymentVerifyPage";

export default function App() {
  const location = useLocation()

  return (
    <MainLayout>
      <Routes location={location} key={location.key}>
        <Route path="/" element={<RouteTransition><Home /></RouteTransition>} />

        <Route path="/payment-verify" element={<RouteTransition><PaymentVerifyPage /></RouteTransition>} />

        <Route path="/options">
          <Route path="premium" element={<RouteTransition><TGPremiumOptionsPage /></RouteTransition>} />
          <Route path="stars" element={<RouteTransition><TGStarsPage /></RouteTransition>} />
        </Route>

        <Route path="order-history">
          <Route index element={<RouteTransition> <OrderHistoryPage /></RouteTransition>} />
          <Route path=":orderId" element={<RouteTransition><OrderHistoryDetailPage /></RouteTransition>} />
        </Route>

        <Route path="admin" element={<PrivateRoute allowedRoles="admin" />}>
          <Route path="manage-orders" element={<RouteTransition><ManageOrderListPage /></RouteTransition>} />
          <Route path="manage-orders/:orderId" element={<RouteTransition><ManageOrderDetailsPage /></RouteTransition>} />
        </Route>

      </Routes>
    </MainLayout>
  )
}