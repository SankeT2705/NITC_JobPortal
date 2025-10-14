import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminJobView = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        // 1️⃣ If job came from navigation state (fast path)
        if (location.state) {
          setJob(location.state);
          setLoading(false);
          return;
        }

        // 2️⃣ Fetch from backend if direct URL access
        const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
        if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const res = await axios.get(`/api/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error("❌ Error fetching job:", err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-muted">
        <div className="spinner-border text-primary me-2" role="status" />
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
        <div className="alert alert-warning text-center w-50">
          <h5>⚠️ Job not found</h5>
          <p>This job might have been deleted or you accessed an invalid link.</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate("/admin")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ===== Navbar ===== */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: "#0B3D6E" }}>
        <div className="container-fluid">
          <span className="navbar-brand">NITC Job Portal – Admin</span>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/applications">
                Applications
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-warning" to="/">
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* ===== Job Details ===== */}
      <div className="container py-4 flex-grow-1">
        <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: 900 }}>
          <div className="card-header bg-white">
            <h4 className="fw-bold text-primary mb-0">{job.title}</h4>
            <small className="text-muted">
              Department: {job.department || "N/A"} • Deadline:{" "}
              {job.deadline ? new Date(job.deadline).toLocaleDateString() : "N/A"}
            </small>
          </div>

          <div className="card-body">
            <h6 className="text-secondary">Required Qualifications</h6>
            <p>{job.qualifications || "Not specified"}</p>

            <h6 className="text-secondary">Job Description</h6>
            <p>{job.description || "Not provided"}</p>

            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <>
                <h6 className="text-secondary">Required Skills</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="badge bg-info text-dark">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-warning"
                onClick={() => navigate(`/admin/jobs/${job._id}/edit`, { state: job })}
              >
                Edit Job
              </button>
              <button className="btn btn-outline-secondary" onClick={() => navigate("/admin")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <footer className="text-center py-3 mt-auto bg-dark text-white">
        <small>© {new Date().getFullYear()} NITC Job Portal Admin.</small>
      </footer>
    </div>
  );
};

export default AdminJobView;
