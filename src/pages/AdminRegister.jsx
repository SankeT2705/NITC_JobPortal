import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role:"",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  //Register Admin via Backend API
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
         role: "admin",
      });

      if (res.data) {
      
        navigate("/login-admin");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Try again.";
      alert(message);
      console.error("Admin registration error:", err);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-sm p-4" style={{ width: "350px" }}>
        <h4 className="text-center mb-4 fw-bold text-danger">
          Admin Registration
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
          <div className="mb-3">
            <select
              name="department"
              className="form-select"
              required
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
          </div>
          <button type="submit" className="btn btn-danger w-100 mb-3">
            Register
          </button>
        </form>
        <div className="text-center">
          <small>
            Already have an admin account?{" "}
            <Link to="/login-admin">Login</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
