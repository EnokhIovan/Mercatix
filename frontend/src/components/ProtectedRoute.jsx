import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingPage from "../layouts/LoadingPage";

function ProtectedRoute() {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsValid(false);
      return;
    }

    fetch("http://127.0.0.1:8000/api/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid token");
        }

        return response.json();
      })
      .then(() => {
        setIsValid(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setIsValid(false);
      });
  }, []);

  if (isValid === null) {
    return <LoadingPage action="Memverifikasi sesi"/>
  }

  return isValid
    ? <Outlet />
    : <Navigate to="/login" replace />;
}

export default ProtectedRoute;