import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

/** Reusable axios client */
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

const AdminJobCreate = React.memo(function AdminJobCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const api = useAxiosClient();
  const isEdit = Boolean(id);
  const mountedRef = useRef(true);

  /** Toast system */
  const [alerts, setAlerts] = useState([]);
  const pushAlert = useCallback((message, variant = "info", timeout = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts((prev) => [...prev, { id, message, variant }]);
    if (timeout)
      setTimeout(() => {
        setAlerts((prev) => prev.filter((t) => t.id !== id));
      }, timeout);
  }, []);

  /** Form state */
  const [form, setForm] = useState({
    title: "",
    department: "",
    deadline: "",
    qualifications: "",
    description: "",
    requiredSkills: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /** ===============================
   *  Fetch job details if editing
   *  =============================== */
  useEffect(() => {
    mountedRef.current = true;
    const fetchJob = async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        setErrorMsg("");

        const { data } = await api.get(`/api/jobs/${id}`);
        if (!mountedRef.current) return;

        const job = data;
        setForm({
          title: job.title || "",
          department: job.department || "",
          deadline: job.deadline?.split("T")[0] || "",
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
  }, [api, id, isEdit, pushAlert]);

  /** Input change handler */
  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  /** Submit handler */
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

        if (isEdit) {
          await api.put(`/api/jobs/${id}`, payload);
          pushAlert("Job updated successfully.", "success");
        } else {
          await api.post(`/api/jobs`, payload);
          pushAlert("Job created successfully.", "success");
        }

        setTimeout(() => navigate("/admin"), 800);
      } catch (err) {
        console.error("Job creation/update failed:", err);
        setErrorMsg("Failed to save job. Please check your inputs or network.");
        pushAlert("Failed to save job.", "danger");
      } finally {
        setLoading(false);
      }
    },
    [api, form, isEdit, id, loading, navigate, pushAlert]
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ======== Navbar ======== */}
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
          </ul>
        </div>
      </nav>

      {/* ======== Body ======== */}
      <div className="container py-4 flex-grow-1">
        <div
          className="card shadow-sm border-0 mx-auto"
          style={{ maxWidth: 900 }}
        >
          <div className="card-header bg-white text-center">
            <h5 className="mb-0 fw-bold" style={{ color: "#1C4E80" }}>
              {isEdit ? "Edit Job" : "Create New Job"}
            </h5>
          </div>

          <div className="card-body">
            {errorMsg && (
              <div className="alert alert-danger text-center py-2">
                {errorMsg}
              </div>
            )}

            <form onSubmit={onSubmit}>
              <div className="row g-3">
                {/* Title */}
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

                {/* Skills */}
                <div className="col-12">
                  <label className="form-label">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="requiredSkills"
                    value={form.requiredSkills}
                    onChange={onChange}
                    className="form-control"
                    placeholder="e.g. Python, ReactJS, Node.js"
                  />
                  <small className="text-muted">
                    Helps match candidates effectively.
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
                  {loading
                    ? "Saving..."
                    : isEdit
                    ? "Update Job"
                    : "Save Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ======== Toast Host ======== */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {alerts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center text-white bg-${
              t.variant === "danger"
                ? "danger"
                : t.variant === "success"
                ? "success"
                : t.variant === "info"
                ? "info"
                : "secondary"
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

      {/* ======== Footer ======== */}
      <footer className="text-center py-3 mt-auto bg-dark text-white">
        <small>
          © {new Date().getFullYear()} NITC Job Portal Admin. All rights
          reserved.
        </small>
      </footer>
    </div>
  );
});

export default AdminJobCreate;
