import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";

const UserLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const user = await login("user", email, password);
      alert(`✅ Welcome back, ${user.name || "User"}!`);
      navigate("/dashboard-user");
    } catch (err) {
      const msg =
        err.response?.data?.message || "❌ Invalid credentials. Try again.";
      alert(msg);
      console.error(err);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ width: "350px" }}>
        <h4 className="text-center mb-4 fw-bold text-primary">User Login</h4>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 mb-3">
            Login
          </button>
        </form>
        <div className="text-center">
          <small>
            Don’t have an account? <Link to="/register-user">Register</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
