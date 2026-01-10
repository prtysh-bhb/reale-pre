import { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  if (!token || !user) return <Navigate to="/" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if(user.role == 'admin'){
      return <Navigate to="/admin/dashboard" />;      
    }else if(user.role == 'agent'){
      return <Navigate to="/agent/dashboard" />;
    }else{
      // Redirect non-admin users to customer dashboard
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default ProtectedRoute;
