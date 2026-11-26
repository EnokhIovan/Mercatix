
import CustomerDashboard from "../pages/customer/Dashboard";
import MerchantDashboard from "../pages/merchant/Dashboard";
import { useUser } from "../context/UserContext";

export default function DashboardRouter() {
  const { user } = useUser();

  if (user?.role === "customer") return <CustomerDashboard />;
  if (user?.role === "merchant") return <MerchantDashboard />;

  return <div>Role tidak dikenali.</div>;
}
