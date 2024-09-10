import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MainLayout from "./components/layout/MainLayout";
import Options from "./pages/TGPremiumOptions";

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/options">
          <Route path="tg-premium/:serviceId" element={<Options />} />
          <Route path="stars/:serviceId" element={<h1>stars</h1>} />
          <Route path="fake-referral/:serviceId" element={<h1>fake</h1>} />
        </Route>
      </Routes>
    </MainLayout>
  )
}