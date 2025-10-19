import React from "react";
import { Link } from "react-router-dom";

const LoginSelection = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4 text-center" style={{ width: "350px" }}>
        <h4 className="fw-bold mb-4">Login</h4>
        <p className="text-muted mb-4">
          Select your login type to continue
        </p>
        <div className="d-grid gap-3">
          <Link to="/login-user" className="btn btn-primary fw-semibold">
            Login as User
          </Link>
          <Link to="/login-admin" className="btn btn-danger fw-semibold">
            Login as Admin
          </Link>
        </div>
        <p className="mt-3">
  Want to become an admin? <Link to="/request-admin">Request Access</Link>
</p>

        <div className="mt-3">
          <small>
            Don’t have an account?{" "}
            <Link to="/register-user" className="text-decoration-none">
              Register as User
            </Link>
             
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
