import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import AdminDashboard from "./admin/Dashboard";
import MerchantDashboard from "./merchant/Dashboard";
import CustomerDashboard from "./customer/Dashboard.jsx";
import * as Customer from "./pages/customer";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");

      if (!token) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (response.status === 401) {
          setUnauthorized(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Gagal mengambil data user");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  if (unauthorized) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  if (!user) return <p>Gagal memuat data pengguna.</p>;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;

    case "merchant":
      return <MerchantDashboard />;

    case "customer":
      return <CustomerExplore />;

    default:
      return <Navigate to="/unauthorized" replace />;
  }
}
