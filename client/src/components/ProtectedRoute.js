import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed -> Redirect to user's assigned home portal
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const r = (user.role || "").toLowerCase();
    if (r === "operator") return <Navigate to="/operator" replace />;
    if (r === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;