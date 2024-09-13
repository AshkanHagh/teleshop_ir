import { Route, Routes } from "react-router-dom";
import Home from "./pages/HomePage/HomePage";
import MainLayout from "./components/layout/MainLayout";
import TGPremiumOptionsPage from "./pages/TGPremiumOptionsPage/TGPremiumOptionsPage";
import TGStarsPage from "./pages/TGStarsPage/TGStarsPage";
import OrderListPage from "./pages/OrderListPage/OrderListPage";
import OrderDetailsPage from "./pages/OrderDetailsPage/OrderDetailsPage";

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/options">
          <Route path="tg-premium/:serviceId" element={<TGPremiumOptionsPage />} />
          <Route path="stars/:serviceId" element={<TGStarsPage />} />
        </Route>

        <Route path="/orders">
          <Route index element={<OrderListPage />} />
          <Route path=":orderID" element={<OrderDetailsPage />} />
        </Route>
      </Routes>
    </MainLayout>
  )
}