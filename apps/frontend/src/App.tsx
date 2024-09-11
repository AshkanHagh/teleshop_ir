import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MainLayout from "./components/layout/MainLayout";
import TGPremiumOptionsPage from "./pages/TGPremiumOptionsPage";
import TGStarsPage from "./pages/TGStarsPage";

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/options">
          <Route path="tg-premium/:serviceId" element={<TGPremiumOptionsPage />} />
          <Route path="stars/:serviceId" element={<TGStarsPage />} />
        </Route>
      </Routes>
    </MainLayout>
  )
}