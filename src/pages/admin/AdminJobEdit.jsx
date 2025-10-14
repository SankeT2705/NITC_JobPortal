import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminJobEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    department: "",
    deadline: "",
    qualifications: "",
    description: "",
    requiredSkills: "",
  });

  const [loading, setLoading] = useState(true);

  // ✅ Fetch job details from backend
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
        if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const res = await axios.get(`/api/jobs/${id}`);
        const job = res.data;

        setForm({
          title: job.title,
          department: job.department,
          deadline: job.deadline ? job.deadline.split("T")[0] : "",
          qualifications: job.qualifications,
          description: job.description,
          requiredSkills: (job.requiredSkills || []).join(", "),
        });
      } catch (err) {
        console.error("❌ Error loading job:", err);
        alert("Failed to load job details. Try refreshing the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ✅ Handle form changes
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Update job via backend
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
      if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const updatedData = { ...form };
      await axios.put(`/api/jobs/${id}`, updatedData);

      alert("✅ Job updated successfully!");
      navigate("/admin");
    } catch (err) {
      console.error("❌ Error updating job:", err);
      alert("Failed to update job. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center text-muted">
        <div className="spinner-border text-primary me-2" role="status" />
        Loading job details...
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: "#0B3D6E" }}>
        <div className="container-fluid">
          <span className="navbar-brand">NITC Job Portal – Admin</span>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/applications">Applications</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-warning" to="/">Logout</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Body */}
      <div className="container py-4 flex-grow-1">
        <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: 900 }}>
          <div className="card-header bg-white">
            <h5 className="mb-0 fw-bold" style={{ color: "#1C4E80" }}>Edit Job</h5>
          </div>
          <div className="card-body">
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
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input
                    name="requiredSkills"
                    value={form.requiredSkills}
                    onChange={onChange}
                    className="form-control"
                    placeholder="e.g. ReactJS, Node.js, MongoDB"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Updating..." : "Update Job"}
                </button>
                <Link to="/admin" className="btn btn-outline-secondary">
                  Cancel
                </Link>
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

export default AdminJobEdit;
