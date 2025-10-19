import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const AdminJobCreate = React.memo(function AdminJobCreate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const apiBase = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:5000",
    []
  );

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
  const isEdit = Boolean(id);
  const mountedRef = useRef(true);

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

        const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
        if (token)
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axios.defaults.baseURL = apiBase;

        const res = await axios.get(`/api/jobs/${id}`);
        if (!mountedRef.current) return;

        const job = res.data;
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
        setErrorMsg("⚠️ Failed to load job details. Please try again.");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    fetchJob();

    return () => {
      mountedRef.current = false;
    };
  }, [id, isEdit, apiBase]);

  /** ===============================
   *  Input change handler
   *  =============================== */
  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  /** ===============================
   *  Submit handler (Create / Update)
   *  =============================== */
  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;

      setLoading(true);
      setErrorMsg("");

      try {
        const adminToken = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
        if (adminToken)
          axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
        axios.defaults.baseURL = apiBase;

        const payload = {
          ...form,
          requiredSkills: form.requiredSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };

        if (isEdit) {
          await axios.put(`/api/jobs/${id}`, payload);
         
        } else {
          await axios.post(`/api/jobs`, payload);
          
        }

        navigate("/admin");
      } catch (err) {
        console.error("Job creation/update failed:", err);
        setErrorMsg("❌ Failed to save job. Please check your inputs or network.");
      } finally {
        setLoading(false);
      }
    },
    [form, isEdit, id, navigate, apiBase, loading]
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ======== Navbar ======== */}
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
          </ul>
        </div>
      </nav>

      {/* ======== Body ======== */}
      <div className="container py-4 flex-grow-1">
        <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: 900 }}>
          <div className="card-header bg-white text-center">
            <h5 className="mb-0 fw-bold" style={{ color: "#1C4E80" }}>
              {isEdit ? "Edit Job" : "Create New Job"}
            </h5>
          </div>

          <div className="card-body">
            {errorMsg && (
              <div className="alert alert-danger text-center py-2">{errorMsg}</div>
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
                  <label className="form-label">Required Skills (comma-separated)</label>
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
                <Link to="/admin" className="btn btn-outline-secondary" disabled={loading}>
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

      {/* ======== Footer ======== */}
      <footer className="text-center py-3 mt-auto bg-dark text-white">
        <small>
          © {new Date().getFullYear()} NITC Job Portal Admin. All rights reserved.
        </small>
      </footer>
    </div>
  );
});

export default AdminJobCreate;
