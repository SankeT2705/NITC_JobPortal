import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const LoginSelection = React.memo(function LoginSelection() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar (Same as Home page style) */}
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
                <Link className="nav-link active" aria-current="page" to="/select-login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Card Section */}
      <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="card shadow-lg border-0 p-4 text-center" style={{ width: "360px", borderRadius: "16px" }}>
          <h4 className="fw-bold mb-3 text-primary">
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Login
          </h4>
          <p className="text-muted mb-4 small">Select your login type to continue</p>

          {/* Login Buttons */}
          <div className="d-grid gap-3">
            <Link to="/login-user" className="btn btn-outline-primary fw-semibold py-2">
              <i className="bi bi-person-circle me-2"></i>
              Login as User
            </Link>

            <Link to="/login-admin" className="btn btn-outline-danger fw-semibold py-2">
              <i className="bi bi-shield-lock me-2"></i>
              Login as Admin
            </Link>
          </div>

          {/* Admin Access Request */}
          <p className="mt-4 mb-1 small text-secondary">
            Want to become an admin?{" "}
            <Link to="/request-admin" className="fw-semibold text-decoration-none">
              Request Access
            </Link>
          </p>

          {/* Registration */}
          <div className="mt-2">
            <small className="text-muted">
              Don’t have an account?{" "}
              <Link to="/register-user" className="fw-semibold text-decoration-none">
                Register as User
              </Link>
            </small>
          </div>
        </div>
      </div>

      {/* Footer (same design as Home for consistency) */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>© {new Date().getFullYear()} NIT Calicut — Job Portal | Designed by Team 6</small>
      </footer>
    </div>
  );
});

export default LoginSelection;
