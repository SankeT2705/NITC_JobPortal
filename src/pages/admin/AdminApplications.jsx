import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Spinner, Badge } from "react-bootstrap";
import axios from "axios";

const AdminApplications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const adminToken = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
 useEffect(() => {
  const fetchApplications = async () => {
    try {
      if (adminToken)
        axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;

      console.log("📨 Fetching applications for admin:", adminUser.email);

      const res = await axios.get(`/api/applications/admin/${adminUser.email}`);
      setApplications(res.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      alert("⚠️ Failed to load applications. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  fetchApplications();
}, [adminToken]);

// ✅ Update application status
 // ✅ Update application status (Accept / Reject)
const updateStatus = async (id, status) => {
  try {
    const adminToken = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;

    if (!adminToken) {
      alert("⚠️ Admin not logged in. Please re-login.");
      return;
    }

    // ✅ Always attach Authorization header before request
    axios.defaults.baseURL = "http://localhost:5000";
    axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;

    const res = await axios.put(`/api/applications/${id}/status`, { status });

    alert(`✅ Application marked as ${status}`);
    console.log("✅ Status updated:", res.data);

    // Refresh list after update
    const refreshed = await axios.get(`/api/applications/admin/${adminUser.email}`);
    setApplications(refreshed.data || []);
  } catch (err) {
    console.error("❌ Status update failed:", err);
    alert(
      err.response?.data?.message ||
        "❌ Failed to update application status. Please check backend connection."
    );
  }
};



  // ✅ Modal control
  const openModal = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    localStorage.removeItem("nitc_user");
    navigate("/");
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ===== Navbar ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-sm"
        style={{ background: "#0B3D6E" }}
      >
        <div className="container-fluid">
          <span className="navbar-brand fw-semibold">NITC Job Portal – Admin</span>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/admin/applications">
                Applications
              </Link>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-link nav-link text-warning"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* ===== Main Body ===== */}
      <div className="container py-4 flex-grow-1">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-primary">Applications Overview</h5>
            <span className="badge bg-secondary">{applications.length} Total</span>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <div className="text-muted mt-2">Loading applications...</div>
              </div>
            ) : applications.length === 0 ? (
              <p className="text-center text-muted">No applications yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Applicant</th>
                      <th>Job Title</th>
                      <th>Applied On</th>
                      <th>Status</th>
                      <th>Resume</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((a) => (
                      <tr key={a._id}>
                        <td>
                          <strong>{a.applicant?.name}</strong>
                          <div className="text-muted small">{a.applicant?.email}</div>
                        </td>
                        <td>{a.job?.title}</td>
                        <td>{new Date(a.appliedOn).toLocaleDateString()}</td>
                        <td>
                          <Badge
                            bg={
                              a.status === "Accepted"
                                ? "success"
                                : a.status === "Rejected"
                                ? "danger"
                                : "secondary"
                            }
                          >
                            {a.status}
                          </Badge>
                        </td>
                        <td>
                          {a.resumeUrl ? (
                            <a
                              href={a.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                              download={`Resume_${a.applicant?.name || "user"}.pdf`}
                            >
                              View
                            </a>
                          ) : (
                            <span className="text-muted small">No resume</span>
                          )}
                        </td>
                        <td className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openModal(a)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            disabled={a.status !== "Pending"}
                            onClick={() => updateStatus(a._id, "Accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={a.status !== "Pending"}
                            onClick={() => updateStatus(a._id, "Rejected")}
                          >
                            Reject
                          </Button>
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

      {/* ===== Modal ===== */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp ? (
            <>
              <p>
                <strong>Applicant:</strong> {selectedApp.applicant?.name} (
                {selectedApp.applicant?.email})
              </p>
              <p>
                <strong>Job Title:</strong> {selectedApp.job?.title}
              </p>
              <p>
                <strong>Department:</strong> {selectedApp.job?.department}
              </p>
              <p>
                <strong>Applied On:</strong>{" "}
                {new Date(selectedApp.appliedOn).toLocaleString()}
              </p>

              {selectedApp.coverLetter ? (
                <>
                  <strong>Cover Letter:</strong>
                  <div className="border rounded p-2 bg-light mt-2">
                    {selectedApp.coverLetter}
                  </div>
                </>
              ) : (
                <p className="text-muted mt-3">No cover letter provided.</p>
              )}

              {selectedApp.resumeUrl && (
                <div className="mt-3">
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                    download={`Resume_${selectedApp.applicant?.name || "user"}.pdf`}
                  >
                    View Resume
                  </a>
                </div>
              )}
            </>
          ) : (
            <p>No details found.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedApp && selectedApp.status === "Pending" && (
            <>
              <Button
                variant="success"
                onClick={() => updateStatus(selectedApp._id, "Accepted")}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                onClick={() => updateStatus(selectedApp._id, "Rejected")}
              >
                Reject
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Footer ===== */}
      <footer className="text-center py-3 mt-auto bg-dark text-white">
        <small>© {new Date().getFullYear()} NITC Job Portal Admin.</small>
      </footer>
    </div>
  );
};

export default AdminApplications;
