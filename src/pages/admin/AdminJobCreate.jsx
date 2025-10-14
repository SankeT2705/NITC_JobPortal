 import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const AdminJobCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    department: "",
    deadline: "",
    qualifications: "",
    description: "",
    requiredSkills: "",
  });

  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  // ✅ Load job for editing (if ID present)
  useEffect(() => {
    const fetchJob = async () => {
      if (!isEdit) return;
      try {
        const res = await axios.get(`/api/jobs/${id}`);
        const job = res.data;
        setForm({
          title: job.title,
          department: job.department,
          deadline: job.deadline?.split("T")[0],
          qualifications: job.qualifications,
          description: job.description,
          requiredSkills: (job.requiredSkills || []).join(", "),
        });
      } catch (err) {
        console.error("Error loading job:", err);
        alert("⚠️ Failed to load job details.");
      }
    };
    fetchJob();
  }, [id, isEdit]);

  // ✅ Field Change
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Submit Handler
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
      const adminToken = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;

      // Axios Auth Header
      if (adminToken)
        axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;

      const payload = { ...form };

      if (isEdit) {
        await axios.put(`/api/jobs/${id}`, payload);
        alert("✅ Job Updated Successfully!");
      } else {
        await axios.post("/api/jobs", payload);
        alert("✅ Job Created Successfully!");
      }

      navigate("/admin");
    } catch (err) {
      console.error("Job creation/update failed:", err);
      alert("❌ Failed to save job. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

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
                  <small className="text-muted">Helps match candidates effectively.</small>
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex gap-2 mt-4 justify-content-end">
                <Link to="/admin" className="btn btn-outline-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : isEdit ? "Update Job" : "Save Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-3 mt-auto bg-dark text-white">
        <small>© {new Date().getFullYear()} NITC Job Portal Admin.</small>
      </footer>
    </div>
  );
};

export default AdminJobCreate;
