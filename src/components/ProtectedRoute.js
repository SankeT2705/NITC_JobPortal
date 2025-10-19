import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 * Ensures that only authenticated users with allowed roles can access child routes.
 * 
 * @param {ReactNode} children - The protected content
 * @param {string[]} allowedRoles - Array of allowed user roles (e.g. ["admin", "user"])
 */
const ProtectedRoute = React.memo(({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  const location = useLocation();

  // ✅ Memoize derived state for performance
  const { isLoggedIn, isAuthorized } = useMemo(() => {
    const role = user?.role || null;
    return {
      isLoggedIn: Boolean(user),
      isAuthorized: allowedRoles.includes(role),
    };
  }, [user, allowedRoles]);

  // ✅ Loading fallback (helps during refresh or context rehydration)
  if (user === undefined) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-muted">
        <div className="spinner-border text-primary me-2" role="status" />
        Checking authentication...
      </div>
    );
  }

  // ✅ Not logged in → redirect to login, preserving attempted path
  if (!isLoggedIn) {
    return <Navigate to="/select-login" state={{ from: location }} replace />;
  }

  // ✅ Logged in but unauthorized → redirect home
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  // ✅ Access granted
  return children;
});

export default ProtectedRoute;
