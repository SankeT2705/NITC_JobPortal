import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Modal, Button, Form } from "react-bootstrap";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const currentAdmin = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const adminName = currentAdmin?.name || "Admin";

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplications: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ Fetch Jobs + Stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
        if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const jobsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs/admin/${currentAdmin.email}`);
        setJobs(jobsRes.data || []);

        const appsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/applications/admin/${currentAdmin.email}`);
        setStats({
          activeJobs: jobsRes.data?.length || 0,
          totalApplications: appsRes.data?.length || 0,
        });
      } catch (err) {
        console.error("❌ Error loading dashboard data:", err);
        alert("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ✅ Delete a Job
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/jobs/${id}`);
      alert("🗑️ Job deleted successfully!");
      setJobs((prev) => prev.filter((job) => job._id !== id));
      setStats((prev) => ({ ...prev, activeJobs: prev.activeJobs - 1 }));
    } catch (err) {
      console.error("❌ Error deleting job:", err);
      alert("Failed to delete job.");
    }
  };

  // ✅ Change Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("⚠️ Password must be at least 6 characters long");
      return;
    }

    try {
      setSaving(true);
      const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
      if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/update-password`, {
        newPassword,
      });

      alert("✅ Password updated successfully!");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err) {
      console.error("❌ Error updating password:", err);
      alert("Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Navigation
  const handleCreateJob = () => navigate("/admin/jobs/new");
  const goDashboard = () => navigate("/admin");

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ===== Navbar ===== */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ background: "#0B3D6E" }}>
        <div className="container-fluid">
          <span className="navbar-brand fw-semibold">NITC Job Portal Admin</span>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="btn btn-link nav-link active" onClick={goDashboard}>
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/applications">
                Applications
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-link nav-link text-warning" onClick={logout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <div className="container-fluid py-4 flex-grow-1">
        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="card shadow-sm border-0 p-3 mb-3">
              <h4 className="text-primary mb-2">Welcome, {adminName}</h4>
              <p className="text-muted small mb-3">
                Manage job postings and review applications efficiently.
              </p>
              <button className="btn btn-warning fw-semibold w-100 mb-2" onClick={handleCreateJob}>
                + Create New Job
              </button>
              <button
                className="btn btn-outline-primary fw-semibold w-100"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
            </div>

            {/* Stats */}
            <div className="card shadow-sm border-0 p-3 mb-3 text-center">
              <div className="text-muted">Active Jobs</div>
              <div className="display-6 text-primary fw-bold">{stats.activeJobs}</div>
            </div>
            <div className="card shadow-sm border-0 p-3 text-center">
              <div className="text-muted">Total Applications</div>
              <div className="display-6 text-primary fw-bold">{stats.totalApplications}</div>
            </div>
          </div>

          {/* Job Table */}
          <div className="col-lg-9">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <h5 className="mb-0 text-center fw-bold text-primary">Your Job Postings</h5>
              </div>

              <div className="card-body">
                {loading ? (
                  <p className="text-center text-muted my-4">⏳ Loading jobs...</p>
                ) : jobs.length === 0 ? (
                  <p className="text-center text-muted my-4">
                    No jobs yet. Click “Create New Job” to add one.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Title</th>
                          <th>Department</th>
                          <th>Deadline</th>
                          <th>Applicants</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <tr key={job._id}>
                            <td>{job.title}</td>
                            <td>{job.department}</td>
                            <td>{new Date(job.deadline).toLocaleDateString()}</td>
                            <td>{job.applicantCount ?? 0}</td>
                            <td className="d-flex gap-2">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => navigate(`/admin/jobs/${job._id}`)}
                              >
                                View
                              </button>
                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() => navigate(`/admin/jobs/${job._id}/edit`, { state: job })}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(job._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Password Change Modal ===== */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handlePasswordChange}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Updating..." : "Update Password"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Footer ===== */}
      <footer className="text-center py-3 mt-auto bg-dark text-white">
        <small>© {new Date().getFullYear()} NITC Job Portal Admin. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default AdminDashboard;
