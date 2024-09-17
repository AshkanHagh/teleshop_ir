import { Route, Routes } from "react-router-dom";
import Home from "./pages/homePage/HomePage";
import MainLayout from "./components/layout/MainLayout";
import TGPremiumOptionsPage from "./pages/tgPremiumOptionsPage/TGPremiumPage";
import TGStarsPage from "./pages/tgStarsPage/TGStarsPage";
import ManageOrderListPage from "./pages/manageOrdersPage/ManageOrdersPage";
import ManageOrderDetailsPage from "./pages/manageOrderDetailsPage/ManageOrderDetailsPage";
import OrderHistoryPage from "./pages/orderHistoryListPage/OrderHistoryPage";
import OrderHistoryDetailPage from "./pages/orderHistoryDetailsPage/OrderHistoryDetailsPage";

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/options">
          <Route path="premium" element={<TGPremiumOptionsPage />} />
          <Route path="stars" element={<TGStarsPage />} />
        </Route>

        <Route path="order-history">
          <Route index element={<OrderHistoryPage />} />
          <Route path=":orderId" element={<OrderHistoryDetailPage />} />
        </Route>

        <Route path="admin">
          <Route path="manage-orders" element={<ManageOrderListPage />} />
          <Route path="manage-orders/:orderId" element={<ManageOrderDetailsPage />} />
        </Route>

      </Routes>
    </MainLayout>
  )
}