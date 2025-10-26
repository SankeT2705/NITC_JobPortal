import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

/** ========== Axios Client ========== */
const useAxiosClient = () => {
  const apiBase = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:5000",
    []
  );
  const token = useMemo(
    () => JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token || null,
    []
  );

  return useMemo(() => {
    const client = axios.create({
      baseURL: apiBase,
      timeout: 15000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return client;
  }, [apiBase, token]);
};

/** ========== Component ========== */
const AdminJobView = React.memo(function AdminJobView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useAxiosClient();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [alerts, setAlerts] = useState([]);
  const mountedRef = useRef(true);

  /** ========== Toast Alerts ========== */
  const pushAlert = useCallback((message, variant = "info", timeout = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts((prev) => [...prev, { id, message, variant }]);
    if (timeout)
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, timeout);
  }, []);

  /** ========== Fetch Job (with cache) ========== */
  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // ⚡ Use cached state from router if available
      if (location.state && mountedRef.current) {
        setJob(location.state);
        setLoading(false);
        return;
      }

      const { data } = await api.get(`/api/jobs/${id}`);
      if (!mountedRef.current) return;

      setJob(data || null);
    } catch (err) {
      console.error("Error fetching job:", err);
      setJob(null);
      setErrorMsg("Failed to load job details. Please try again.");
      pushAlert("Failed to load job details.", "danger");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id, location.state, api, pushAlert]);

  useEffect(() => {
    mountedRef.current = true;
    fetchJob();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchJob]);

  /** ========== Navigation Handlers ========== */
  const handleEdit = useCallback(() => {
    if (job) {
      pushAlert("Opening job editor...", "info", 2000);
      setTimeout(() => {
        navigate(`/admin/jobs/${job._id}/edit`, { state: job });
      }, 300);
    }
  }, [job, navigate, pushAlert]);

  const handleBack = useCallback(() => {
    navigate("/admin");
  }, [navigate]);

  /** ========== Render States ========== */
  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-muted">
        <div className="spinner-border text-primary me-2" role="status" />
        Loading job details...
      </div>
    );
  }

  if (errorMsg || !job) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
        <div className="alert alert-warning text-center w-50 shadow-sm">
          <h5>{errorMsg || "⚠️ Job not found"}</h5>
          <p>
            {errorMsg
              ? "There was a problem retrieving job information."
              : "This job may have been deleted or you accessed an invalid link."}
          </p>
          <button className="btn btn-primary mt-2" onClick={handleBack}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  /** ========== Main UI ========== */
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ===== Navbar ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        style={{ background: "#0B3D6E" }}
      >
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
        <div
          className="card shadow-sm border-0 mx-auto"
          style={{ maxWidth: 900 }}
        >
          <div className="card-header bg-white">
            <h4 className="fw-bold text-primary mb-0">{job.title}</h4>
            <small className="text-muted">
              Department: {job.department || "N/A"} • Deadline:{" "}
              {job.deadline
                ? new Date(job.deadline).toLocaleDateString()
                : "N/A"}
            </small>
          </div>

          <div className="card-body">
            <h6 className="text-secondary">Required Qualifications</h6>
            <p>{job.qualifications || "Not specified"}</p>

            <h6 className="text-secondary">Job Description</h6>
            <p>{job.description || "Not provided"}</p>

            {Array.isArray(job.requiredSkills) &&
              job.requiredSkills.length > 0 && (
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
              <button className="btn btn-warning" onClick={handleEdit}>
                Edit Job
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleBack}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Toast Host ===== */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {alerts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center text-white bg-${
              t.variant === "danger"
                ? "danger"
                : t.variant === "success"
                ? "success"
                : "info"
            } border-0 mb-2`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() =>
                  setAlerts((a) => a.filter((x) => x.id !== t.id))
                }
                aria-label="Close"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ===== Footer ===== */}
      <footer className="text-center py-3 mt-auto bg-dark text-white">
        <small>
          © {new Date().getFullYear()} NITC Job Portal Admin. All rights
          reserved.
        </small>
      </footer>
    </div>
  );
});

export default AdminJobView;
