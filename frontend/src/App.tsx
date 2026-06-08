import { Route, Routes, useLocation } from "react-router-dom"
import Home from "./pages/home-page/HomePage"
import MainLayout from "./components/layout/MainLayout"
import PremiumOptionsPage from "./pages/premium-options-page/PremiumPage"
import StarsPage from "./pages/stars-page/StarsPage"
import ManageOrderListPage from "./pages/manage-orders-page/ManageOrdersPage"
import ManageOrderDetailsPage from "./pages/manage-order-details-page/ManageOrderDetailsPage"
import OrderHistoryPage from "./pages/order-history-list-page/OrderHistoryPage"
import OrderHistoryDetailPage from "./pages/order-history-details-page/OrderHistoryDetailsPage"
import RouteTransition from "./components/animation/RouteTransition"
import PrivateRoute from "./components/PrivateRoute"
import PaymentVerifyPage from "./pages/payment-verify/PaymentVerifyPage"

export default function App() {
  const location = useLocation()

  return (
    <MainLayout>
      <Routes location={location} key={location.key}>
        <Route
          path="/"
          element={
            <RouteTransition>
              <Home />
            </RouteTransition>
          }
        />

        <Route
          path="/payment-verify"
          element={
            <RouteTransition>
              <PaymentVerifyPage />
            </RouteTransition>
          }
        />

        <Route path="/options">
          <Route
            path="premium"
            element={
              <RouteTransition>
                <PremiumOptionsPage />
              </RouteTransition>
            }
          />
          <Route
            path="stars"
            element={
              <RouteTransition>
                <StarsPage />
              </RouteTransition>
            }
          />
        </Route>

        <Route path="order-history">
          <Route
            index
            element={
              <RouteTransition>
                {" "}
                <OrderHistoryPage />
              </RouteTransition>
            }
          />
          <Route
            path=":orderId"
            element={
              <RouteTransition>
                <OrderHistoryDetailPage />
              </RouteTransition>
            }
          />
        </Route>

        <Route path="admin" element={<PrivateRoute allowedRoles="admin" />}>
          <Route
            path="manage-orders"
            element={
              <RouteTransition>
                <ManageOrderListPage />
              </RouteTransition>
            }
          />
          <Route
            path="manage-orders/:orderId"
            element={
              <RouteTransition>
                <ManageOrderDetailsPage />
              </RouteTransition>
            }
          />
        </Route>
      </Routes>
    </MainLayout>
  )
}
