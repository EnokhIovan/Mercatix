
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
import { UserProvider } from "../context/UserContext";

import Login from "../pages/auth/Login";
import NotFound from "../pages/NotFound";

import CustomerExplore from "../pages/customer/Explore";
import CustomerProfile from "../pages/customer/Profile";
import DashboardRouter from "./DashboardRouter";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <UserProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/explore" element={<CustomerExplore />} />
              <Route path="/profile" element={<CustomerProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;
