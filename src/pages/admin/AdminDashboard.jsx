import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const AdminDashboard = React.memo(function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const currentAdmin = useMemo(
    () => JSON.parse(localStorage.getItem("admin_user") || "{}"),
    []
  );
  const adminName = currentAdmin?.name || "Admin";
  const apiBase = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:5000",
    []
  );

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplications: 0 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  /** ======================
   *  FETCH DASHBOARD DATA
   *  ===================== */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
      if (token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axios.defaults.baseURL = apiBase;

      const [jobsRes, appsRes] = await Promise.all([
        axios.get(`/api/jobs/admin/${currentAdmin.email}`),
        axios.get(`/api/applications/admin/${currentAdmin.email}`),
      ]);

      const jobList = jobsRes.data || [];
      const appList = appsRes.data || [];

      setJobs(jobList);
      setStats({
        activeJobs: jobList.length,
        totalApplications: appList.length,
      });
    } catch (err) {
      console.error("❌ Error loading dashboard data:", err);
      setErrorMsg("⚠️ Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [apiBase, currentAdmin.email]);

  // Mount only once
  useEffect(() => {
    let isMounted = true;
    fetchDashboardData().catch((e) => console.error(e));
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  /** ======================
   *  DELETE JOB
   *  ===================== */
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this job?")) return;
      try {
        const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
        if (token)
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axios.defaults.baseURL = apiBase;

        await axios.delete(`/api/jobs/${id}`);
        setJobs((prev) => prev.filter((job) => job._id !== id));
        setStats((prev) => ({ ...prev, activeJobs: prev.activeJobs - 1 }));
      } catch (err) {
        console.error("❌ Error deleting job:", err);
        alert("Failed to delete job. Please try again.");
      }
    },
    [apiBase]
  );

  /** ======================
   *  PASSWORD CHANGE
   *  ===================== */
  const handlePasswordChange = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newPassword.trim() || newPassword.length < 6) {
        alert("⚠️ Password must be at least 6 characters long.");
        return;
      }

      try {
        setSaving(true);
        const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
        if (token)
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        axios.defaults.baseURL = apiBase;

        await axios.put(`/api/auth/update-password`, { newPassword });
        alert("✅ Password updated successfully!");
        setShowPasswordModal(false);
        setNewPassword("");
      } catch (err) {
        console.error("❌ Error updating password:", err);
        alert("Failed to update password. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [apiBase, newPassword]
  );

  /** ======================
   *  NAVIGATION HANDLERS
   *  ===================== */
  const handleCreateJob = useCallback(() => navigate("/admin/jobs/new"), [navigate]);
  const goDashboard = useCallback(() => navigate("/admin"), [navigate]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ===== Navbar ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-sm"
        style={{ background: "#0B3D6E" }}
      >
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
              <button
                className="btn btn-link nav-link text-warning"
                onClick={logout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <div className="container-fluid py-4 flex-grow-1">
        {errorMsg && (
          <div className="alert alert-danger text-center py-2">{errorMsg}</div>
        )}

        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="card shadow-sm border-0 p-3 mb-3">
              <h4 className="text-primary mb-2">Welcome, {adminName}</h4>
              <p className="text-muted small mb-3">
                Manage job postings and review applications efficiently.
              </p>
              <button
                className="btn btn-warning fw-semibold w-100 mb-2"
                onClick={handleCreateJob}
                disabled={loading}
              >
                + Create New Job
              </button>
              <button
                className="btn btn-outline-primary fw-semibold w-100"
                onClick={() => setShowPasswordModal(true)}
                disabled={saving}
              >
                Change Password
              </button>
            </div>

            {/* Stats */}
            <div className="card shadow-sm border-0 p-3 mb-3 text-center">
              <div className="text-muted">Active Jobs</div>
              <div className="display-6 text-primary fw-bold">
                {loading ? "…" : stats.activeJobs}
              </div>
            </div>
            <div className="card shadow-sm border-0 p-3 text-center">
              <div className="text-muted">Total Applications</div>
              <div className="display-6 text-primary fw-bold">
                {loading ? "…" : stats.totalApplications}
              </div>
            </div>
          </div>

          {/* Job Table */}
          <div className="col-lg-9">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <h5 className="mb-0 text-center fw-bold text-primary">
                  Your Job Postings
                </h5>
              </div>

              <div className="card-body">
                {loading ? (
                  <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-2">Loading jobs...</p>
                  </div>
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
                            <td>
                              {job.deadline
                                ? new Date(job.deadline).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td>{job.applicantCount ?? 0}</td>
                            <td className="d-flex gap-2 flex-wrap">
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() =>
                                  navigate(`/admin/jobs/${job._id}`)
                                }
                              >
                                View
                              </button>
                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() =>
                                  navigate(`/admin/jobs/${job._id}/edit`, {
                                    state: job,
                                  })
                                }
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
      <Modal
        show={showPasswordModal}
        onHide={() => {
          setShowPasswordModal(false);
          setNewPassword("");
        }}
        centered
      >
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
                minLength={6}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ===== Footer ===== */}
      <footer className="text-center py-3 mt-auto bg-dark text-white">
        <small>
          © {new Date().getFullYear()} NITC Job Portal Admin. All rights reserved.
        </small>
      </footer>
    </div>
  );
});

export default AdminDashboard;
