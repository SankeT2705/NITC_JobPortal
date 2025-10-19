import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  return (
    <div className="d-flex flex-column min-vh-100">

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
                <Link className="nav-link active" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/select-login">
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

      {/* Hero Section */}
      <section className="bg-primary text-white text-center d-flex flex-column justify-content-center align-items-center flex-grow-1 py-5 px-3">
        <div className="container">
          <h1 className="display-5 fw-bold mb-3">
            Welcome to NITC Job Portal
          </h1>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: "700px" }}>
            A centralized recruitment platform for posting jobs, applying online,
            and managing the hiring process seamlessly at NIT Calicut.
          </p>
          <p className="lead mb-4 mx-auto">
                <Link className="nav-link" to="/select-login">Lets Start..</Link>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-5">
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <i className="bi bi-person-badge fs-1 text-primary mb-3"></i>
                <h5 className="card-title">For Job Seekers</h5>
                <p className="card-text text-muted">
                  Browse job openings, apply online, and track your application
                  status all in one place.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <i className="bi bi-briefcase fs-1 text-primary mb-3"></i>
                <h5 className="card-title">For Admins</h5>
                <p className="card-text text-muted">
                  Post jobs, manage applications, and find the best candidates
                  through an organized dashboard.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <i className="bi bi-envelope-check fs-1 text-primary mb-3"></i>
                <h5 className="card-title">Smart Notifications</h5>
                <p className="card-text text-muted">
                  Get instant email updates for job matches, status changes, and
                  new opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()} NIT Calicut — Job Portal | Designed by
          Team 6
        </small>
      </footer>
    </div>
  );
};

export default Home;
