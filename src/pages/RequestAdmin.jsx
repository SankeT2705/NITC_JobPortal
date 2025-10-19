import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container, Spinner, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const RequestAdmin = React.memo(function RequestAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", department: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/request-admin`,
        form,
        { timeout: 8000 } // prevent hanging
      );

      setMessage("✅ Request submitted successfully!");
      setTimeout(() => navigate("/login-admin"), 1500);
    } catch (err) {
      console.error("Admin request error:", err);
      setMessage("❌ Failed to submit request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
                <Link className="nav-link active" to="/request-admin">
                  Request Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Form Section */}
      <Container className="flex-grow-1 d-flex justify-content-center align-items-center py-5">
        <Card className="shadow-lg border-0 p-4" style={{ maxWidth: "450px", width: "100%", borderRadius: "16px" }}>
          <h4 className="fw-bold text-center text-primary mb-3">
            Request for Admin Access
          </h4>
          <p className="text-muted text-center mb-4 small">
            Fill out the form below to request administrative privileges.
          </p>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your institutional email"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="department">
              <Form.Label>Department</Form.Label>
              <Form.Control
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                placeholder="Department name (e.g., CSE)"
              />
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                className="fw-semibold py-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </Form>

          {message && (
            <p
              className={`mt-3 text-center fw-semibold ${
                message.startsWith("✅") ? "text-success" : "text-danger"
              }`}
            >
              {message}
            </p>
          )}

          <div className="text-center mt-3">
            <small>
              Already an admin?{" "}
              <Link to="/login-admin" className="text-decoration-none fw-semibold">
                Go to Admin Login
              </Link>
            </small>
          </div>
        </Card>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>© {new Date().getFullYear()} NIT Calicut — Job Portal | Designed by Team 6</small>
      </footer>
    </div>
  );
});

export default RequestAdmin;
