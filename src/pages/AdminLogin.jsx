import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const AdminLogin = React.memo(function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Optimized login handler
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;
      setLoading(true);
      setErrorMsg("");

      try {
        const admin = await login("admin", email.trim(), password);
        if (admin) {
        
          navigate("/admin");
        }
      } catch (err) {
        console.error("Admin login error:", err);
        const message =
          err.response?.data?.message || "Invalid admin credentials.";
        setErrorMsg(message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, navigate, loading]
  );

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">
            NITC Job Portal
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/login-admin">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center py-5">
        <div
          className="card shadow-lg border-0 p-4"
          style={{ width: "350px", borderRadius: "16px" }}
        >
          <h4 className="text-center mb-4 fw-bold text-danger">Admin Login</h4>

          {errorMsg && (
            <div className="alert alert-danger py-2" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Admin Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-danger w-100 mb-3 fw-semibold"
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center mt-2">
            <small>
              Want to become an admin?{" "}
              <Link
                to="/request-admin"
                className="fw-semibold text-decoration-none text-primary"
              >
                Request Access
              </Link>
            </small>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()} NITC Job Portal | Designed by Team 6
        </small>
      </footer>
    </div>
  );
});

export default AdminLogin;
