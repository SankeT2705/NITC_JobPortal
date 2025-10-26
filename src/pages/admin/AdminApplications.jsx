import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Spinner, Badge } from "react-bootstrap";
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

const AdminApplications = React.memo(function AdminApplications() {
  const navigate = useNavigate();
  const api = useAxiosClient();

  /** ===== Toast Alert System ===== */
  const [alerts, setAlerts] = useState([]);
  const pushAlert = useCallback((message, variant = "info", timeout = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts((prev) => [...prev, { id, message, variant }]);
    if (timeout)
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, timeout);
  }, []);

  /** ===== Admin Info ===== */
  const adminUser = useMemo(
    () => JSON.parse(localStorage.getItem("admin_user") || "{}"),
    []
  );

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const mountedRef = useRef(true);

  /** ===== Fetch Applications ===== */
  const fetchApplications = useCallback(async () => {
    if (!adminUser?.email) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const { data } = await api.get(`/api/applications/admin/${adminUser.email}`);
      if (mountedRef.current) {
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setErrorMsg("Failed to load applications. Please try again.");
      pushAlert("Failed to load applications.", "danger");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [api, adminUser.email, pushAlert]);

  useEffect(() => {
    mountedRef.current = true;
    fetchApplications();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchApplications]);

  /** ===== Update Application Status ===== */
  const updateStatus = useCallback(
    async (id, status) => {
      try {
        await api.put(`/api/applications/${id}/status`, { status });

        setApplications((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status } : app))
        );

        if (selectedApp && selectedApp._id === id) {
          setSelectedApp((prev) => ({ ...prev, status }));
        }

        pushAlert(`Application marked as ${status}.`, "success");
      } catch (err) {
        console.error("Status update failed:", err);
        pushAlert("Failed to update status.", "danger");
      }
    },
    [api, selectedApp, pushAlert]
  );

  /** ===== Modal & Navigation ===== */
  const openModal = useCallback((app) => {
    setSelectedApp(app);
    setShowModal(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("admin_user");
    localStorage.removeItem("nitc_user");
    navigate("/");
  }, [navigate]);

  const handleViewResume = useCallback((url) => {
    if (!url) {
      pushAlert("No resume found for this applicant.", "warning");
      return;
    }
    setPreviewUrl(url);
    setTimeout(() => {
      const preview = document.getElementById("resume-preview");
      if (preview) preview.scrollIntoView({ behavior: "smooth" });
    }, 200);
  }, [pushAlert]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* ===== Navbar ===== */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-sm"
        style={{ background: "#0B3D6E" }}
      >
        <div className="container-fluid">
          <span className="navbar-brand fw-semibold">
            NITC Job Portal – Admin
          </span>
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
        {errorMsg && (
          <div className="alert alert-danger text-center">{errorMsg}</div>
        )}

        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-primary">Applications Overview</h5>
            <span className="badge bg-secondary">
              {applications.length} Total
            </span>
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
                          <strong>{a.applicant?.name || "Unknown"}</strong>
                          <div className="text-muted small">
                            {a.applicant?.email || "N/A"}
                          </div>
                        </td>
                        <td>{a.job?.title || "N/A"}</td>
                        <td>
                          {a.appliedOn
                            ? new Date(a.appliedOn).toLocaleDateString()
                            : "N/A"}
                        </td>
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
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewResume(a.resumeUrl)}
                            >
                              View
                            </Button>
                          ) : (
                            <span className="text-muted small">No resume</span>
                          )}
                        </td>
                        <td className="d-flex gap-2 flex-wrap">
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

      {/* ===== Resume Preview ===== */}
      {previewUrl && (
        <div id="resume-preview" className="mt-4 card shadow-sm border-0 p-3">
          <h6 className="fw-bold text-primary mb-3">Resume Preview</h6>
          <iframe
            src={previewUrl}
            title="Resume Preview"
            width="100%"
            height="600px"
            style={{
              border: "2px solid #0B3D6E",
              borderRadius: "6px",
              backgroundColor: "#f8f9fa",
            }}
          ></iframe>
          <div className="text-end mt-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setPreviewUrl(null)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      )}

      {/* ===== Details Modal ===== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
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
                    download={`Resume_${
                      selectedApp.applicant?.name || "user"
                    }.pdf`}
                  >
                    Download Resume
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

      {/* ===== Toast Host ===== */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {alerts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center text-white bg-${
              t.variant === "danger"
                ? "danger"
                : t.variant === "warning"
                ? "warning text-dark"
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

export default AdminApplications;
