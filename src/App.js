import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Pages
import Home from "./pages/Home";
import LoginSelection from "./pages/LoginSelection";
import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import UserRegister from "./pages/UserRegister";
import AdminRegister from "./pages/AdminRegister";
import UserDashboard from "./pages/UserDashboard";
import UserProfile from "./pages/UserProfile";

import AdminDashboard from "./pages/admin/AdminDashboard";

import AdminJobCreate from "./pages/admin/AdminJobCreate";
import AdminJobDetails from "./pages/admin/AdminJobView";

import AdminApplications from "./pages/admin/AdminApplications";

// Context
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RequestAdmin from "./pages/RequestAdmin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";



function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/select-login" element={<LoginSelection />} />
          <Route path="/login-user" element={<UserLogin />} />
          <Route path="/login-admin" element={<AdminLogin />} />
          <Route path="/register-user" element={<UserRegister />} />
          
          <Route path="/request-admin" element={<RequestAdmin />} />
<Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />
          {/* Protected User Routes */}
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
