import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Use backend API for login
      const admin = await login("admin", email, password);

      if (admin) {
        alert(`✅ Welcome back, ${admin.name || "Admin"}!`);
        navigate("/admin");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "❌ Invalid admin credentials.";
      alert(message);
      console.error("Admin login error:", err);
    } finally {
      setLoading(false);
    }
  };
console.log("API URL:", process.env.REACT_APP_API_URL);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ width: "350px" }}>
        <h4 className="text-center mb-4 fw-bold text-danger">Admin Login</h4>
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
            className="btn btn-danger w-100 mb-3"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="text-center">
          <small>
            Don’t have an admin account?{" "}
            <Link to="/register-admin">Register</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
