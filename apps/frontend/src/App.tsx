import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MainLayout from "./components/layout/MainLayout";

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MainLayout>
  )
}