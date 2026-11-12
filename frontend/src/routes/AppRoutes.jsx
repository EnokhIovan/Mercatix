import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "../context/CartContext";

import Login from "../pages/auth/Login";
import NotFound from "../pages/NotFound";
import CustomerExplore from "../pages/customer/Explore";
import CustomerDashboard from "../pages/customer/Dashboard";
import CustomerProfile from "../pages/customer/Profile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explore" element={<CustomerExplore />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;