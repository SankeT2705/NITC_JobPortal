import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

/** === Centralized Axios Client Hook === */
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

const AdminJobEdit = React.memo(function AdminJobEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useAxiosClient();
  const mountedRef = useRef(true);

  /** === Toast System === */
  const [alerts, setAlerts] = useState([]);
  const pushAlert = useCallback((message, variant = "info", timeout = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts((a) => [...a, { id, message, variant }]);
    if (timeout)
      setTimeout(() => {
        setAlerts((a) => a.filter((t) => t.id !== id));
      }, timeout);
  }, []);

  /** === State === */
  const [form, setForm] = useState({
    title: "",
    department: "",
    deadline: "",
    qualifications: "",
    description: "",
    requiredSkills: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  /** === Fetch Job Details === */
  useEffect(() => {
    mountedRef.current = true;
    const fetchJob = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const { data } = await api.get(`/api/jobs/${id}`);
        if (!mountedRef.current) return;

        const job = data || {};
        setForm({
          title: job.title || "",
          department: job.department || "",
          deadline: job.deadline ? job.deadline.split("T")[0] : "",
          qualifications: job.qualifications || "",
          description: job.description || "",
          requiredSkills: (job.requiredSkills || []).join(", "),
        });
      } catch (err) {
        console.error("Error loading job:", err);
        setErrorMsg("Failed to load job details. Please try again.");
        pushAlert("Failed to load job details.", "danger");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchJob();
    return () => {
      mountedRef.current = false;
    };
  }, [api, id, pushAlert]);

  /** === Form Input Handler === */
  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  /** === Submit Handler === */
  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;

      setLoading(true);
      setErrorMsg("");

      try {
        const payload = {
          ...form,
          requiredSkills: form.requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };

        await api.put(`/api/jobs/${id}`, payload);
        pushAlert("✅ Job updated successfully!", "success");

        // Delay navigation slightly for better UX
        setTimeout(() => navigate("/admin"), 800);
      } catch (err) {
        console.error("Error updating job:", err);
        setErrorMsg("Failed to update job. Please check inputs or network.");
        pushAlert("Failed to update job.", "danger");
      } finally {
        setLoading(false);
      }
    },
    [api, form, id, loading, navigate, pushAlert]
  );

  /** === Loading UI === */
  if (loading && !form.title && !errorMsg) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-muted">
        <div className="spinner-border text-primary me-2" role="status" />
        Loading job details...
      </div>
    );
  }

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

      {/* ===== Body ===== */}
      <div className="container py-4 flex-grow-1">
        <div
          className="card shadow-sm border-0 mx-auto"
          style={{ maxWidth: 900 }}
        >
          <div className="card-header bg-white">
            <h5 className="mb-0 fw-bold" style={{ color: "#1C4E80" }}>
              Edit Job
            </h5>
          </div>

          <div className="card-body">
            {errorMsg && (
              <div className="alert alert-danger text-center">{errorMsg}</div>
            )}

            <form onSubmit={onSubmit}>
              <div className="row g-3">
                {/* Job Title */}
                <div className="col-md-8">
                  <label className="form-label">Job Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    className="form-control"
                    required
                  />
                </div>

                {/* Department */}
                <div className="col-md-4">
                  <label className="form-label">Department</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={onChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                </div>

                {/* Deadline */}
                <div className="col-md-4">
                  <label className="form-label">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={onChange}
                    className="form-control"
                    required
                  />
                </div>

                {/* Qualifications */}
                <div className="col-12">
                  <label className="form-label">Required Qualifications</label>
                  <textarea
                    name="qualifications"
                    value={form.qualifications}
                    onChange={onChange}
                    className="form-control"
                    rows="3"
                    required
                  />
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label">Job Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    className="form-control"
                    rows="4"
                    required
                  />
                </div>

                {/* Required Skills */}
                <div className="col-12">
                  <label className="form-label">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    name="requiredSkills"
                    value={form.requiredSkills}
                    onChange={onChange}
                    className="form-control"
                    placeholder="e.g. ReactJS, Node.js, MongoDB"
                  />
                  <small className="text-muted">
                    Helps candidates understand expectations.
                  </small>
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex gap-2 mt-4 justify-content-end">
                <Link
                  to="/admin"
                  className="btn btn-outline-secondary"
                  aria-disabled={loading}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    loading ||
                    !form.title.trim() ||
                    !form.department.trim() ||
                    !form.deadline.trim()
                  }
                >
                  {loading ? "Updating..." : "Update Job"}
                </button>
              </div>
            </form>
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

export default AdminJobEdit;
