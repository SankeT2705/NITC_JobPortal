import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const UserLogin = React.memo(function UserLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;

      setLoading(true);
      setErrorMsg("");

      try {
        const user = await login("user", email.trim(), password);
        
        navigate("/dashboard-user");
      } catch (err) {
        console.error("Login failed:", err);
        const msg =
          err.response?.data?.message ||
          "❌ Invalid credentials. Please check your email or password.";
        setErrorMsg(msg);
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
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/login-user">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Login Card */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center py-5">
        <div className="card shadow-lg border-0 p-4" style={{ width: "350px", borderRadius: "16px" }}>
          <h4 className="text-center mb-4 fw-bold text-primary">User Login</h4>

          {errorMsg && (
            <div className="alert alert-danger py-2" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 mb-3 fw-semibold"
              disabled={loading || !email || !password}
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

          <div className="text-center">
            <small>
              Don’t have an account?{" "}
              <Link to="/register-user" className="fw-semibold text-decoration-none">
                Register
              </Link>
            </small>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>© {new Date().getFullYear()} NITC Job Portal | Designed by Team 6</small>
      </footer>
    </div>
  );
});

export default UserLogin;
