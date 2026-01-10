import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  if (token && user) {
    if (user.role === "admin" || user.role === "agent") {
      return <Navigate to="/admin/dashboard" />;
    } else if (user.role === "customer") {
      return <Navigate to="/dashboard" />;
    }
  }

  return <Outlet />;
};

export default PublicRoute;