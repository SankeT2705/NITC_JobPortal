 import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Context
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

//Lazy-load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const LoginSelection = lazy(() => import("./pages/LoginSelection"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const UserRegister = lazy(() => import("./pages/UserRegister"));
const RequestAdmin = lazy(() => import("./pages/RequestAdmin"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));

const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminJobCreate = lazy(() => import("./pages/admin/AdminJobCreate"));
const AdminJobDetails = lazy(() => import("./pages/admin/AdminJobView"));
const AdminApplications = lazy(() =>
  import("./pages/admin/AdminApplications")
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense
          fallback={
            <div className="vh-100 d-flex justify-content-center align-items-center text-muted">
              <div className="spinner-border text-primary me-2" role="status" />
              Loading...
            </div>
          }
        >
          <Routes>
            {/*Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/select-login" element={<LoginSelection />} />
            <Route path="/login-user" element={<UserLogin />} />
            <Route path="/login-admin" element={<AdminLogin />} />
            <Route path="/register-user" element={<UserRegister />} />
            <Route path="/request-admin" element={<RequestAdmin />} />
            <Route
              path="/superadmin-dashboard"
              element={<SuperAdminDashboard />}
            />

            {/*Protected User Routes */}
            <Route
              path="/dashboard-user"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile-user"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/new"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminJobCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminJobDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/:id/edit"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminJobCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applications"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminApplications />
                </ProtectedRoute>
              }
            />

            {/*Fallback 404 */}
            <Route
              path="*"
              element={
                <div className="vh-100 d-flex justify-content-center align-items-center flex-column text-center">
                  <h3 className="text-danger mb-2">404 – Page Not Found</h3>
                  <a href="/" className="btn btn-outline-primary">
                    Back to Home
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
