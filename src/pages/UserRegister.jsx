import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Spinner } from "react-bootstrap";
import axios from "axios";


const UserRegister = React.memo(function UserRegister() {
  const navigate = useNavigate();
  const apiBase = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:5000",
    []
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRegister = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;

      setLoading(true);
      setErrorMsg("");

      try {
        const res = await axios.post(`${apiBase}/api/auth/register`, formData);

        if (res.data) {
          
          navigate("/login-user");
        }
      } catch (err) {
        console.error("Registration failed:", err);
        const msg =
          err.response?.data?.message || "❌ Registration failed. Try again.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    },
    [apiBase, formData, navigate, loading]
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
                <Link className="nav-link active" to="/register-user">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Register Card */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center py-5">
        <div className="card shadow-lg border-0 p-4" style={{ width: "360px", borderRadius: "16px" }}>
          <h4 className="text-center mb-4 fw-bold text-success">
            User Registration
          </h4>

          {errorMsg && (
            <div className="alert alert-danger py-2" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} noValidate>
            <div className="mb-3">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn btn-success w-100 mb-3 fw-semibold"
              disabled={
                loading ||
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.password.trim()
              }
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <div className="text-center">
            <small>
              Already have an account?{" "}
              <Link to="/login-user" className="fw-semibold text-decoration-none">
                Login
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

export default UserRegister;
