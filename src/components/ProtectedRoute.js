import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // not logged in → send to login
    return <Navigate to="/select-login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // logged in but not authorized → redirect
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
