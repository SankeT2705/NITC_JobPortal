import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const UserRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.data) {
        alert("✅ Registration successful! Please login to continue.");
        navigate("/login-user");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "❌ Registration failed. Try again.";
      alert(msg);
      console.error(err);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ width: "350px" }}>
        <h4 className="text-center mb-4 fw-bold text-success">
          User Registration
        </h4>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Full Name"
              required
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              required
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Password"
              required
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-success w-100 mb-3">
            Register
          </button>
        </form>
        <div className="text-center">
          <small>
            Already have an account? <Link to="/login-user">Login</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
