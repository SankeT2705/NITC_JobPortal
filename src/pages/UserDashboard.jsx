import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useDeferredValue,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Modal, Button, Form } from "react-bootstrap";
import NotificationBell from "../components/NotificationBell";
import axios from "axios";

/** ---------- stable helpers ---------- */
const getEnvApi = () =>
  process.env.REACT_APP_API_URL || "http://localhost:5000";
const getToken = () =>
  JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token || null;

/** create a local axios client (doesn't mutate global defaults) */
const useAxiosClient = () => {
  const token = useMemo(getToken, []);
  return useMemo(() => {
    const client = axios.create({
      baseURL: getEnvApi(),
      timeout: 15000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return client;
  }, [token]);
};

const UserDashboard = React.memo(function UserDashboard() {
  const navigate = useNavigate();
  const api = useAxiosClient();
  const [previewUrl, setPreviewUrl] = useState(null);

  /** ---------- lightweight page-scoped alert/toast ---------- */
  const [alerts, setAlerts] = useState([]);
  const pushAlert = useCallback((message, variant = "info", timeout = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts((a) => [...a, { id, message, variant }]);
    if (timeout) {
      window.setTimeout(() => {
        setAlerts((a) => a.filter((t) => t.id !== id));
      }, timeout);
    }
  }, []);

  /** ---------- user bootstrap (memoized) ---------- */
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("current_user") || "{}"),
    []
  );
  const allUsers = useMemo(
    () => JSON.parse(localStorage.getItem("users") || "[]"),
    []
  );
  const currentUser = useMemo(() => {
    const found = allUsers.find((u) => u.email === storedUser.email);
    return found || storedUser || {};
  }, [allUsers, storedUser]);

  const userKey = currentUser?.email || "guest_user";
  const userName = currentUser?.name || "User";

  /** ---------- ui state ---------- */
  const [loading, setLoading] = useState(false);

  // job view modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const handleViewJob = useCallback((job) => {
    setViewJob(job);
    setShowViewModal(true);
  }, []);

  /** ---------- notifications ---------- */
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!currentUser?.email) return;
        const { data } = await api.get(
          `/api/notifications/${currentUser.email}`
        );
        if (!cancelled) setNotifications(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load notifications:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, currentUser?.email]);

  const clearNotifications = useCallback(async () => {
    try {
      if (!currentUser?.email) return;
      await api.delete(`/api/notifications/${currentUser.email}`);
      setNotifications([]);
    } catch (e) {
      console.error("Failed to clear notifications:", e);
    }
  }, [api, currentUser?.email]);

  /** ---------- jobs ---------- */
  const [jobs, setJobs] = useState(() => {
    // tiny warm cache to reduce flash
    try {
      const cached = localStorage.getItem("jobs");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/jobs`);
        const backendJobs = Array.isArray(data) ? data : [];
        const formatted = backendJobs.map((job) => ({
          id: job._id,
          title: job.title,
          department: job.department,
          deadline: job.deadline?.split("T")[0] || "N/A",
          qualifications: job.qualifications,
          description: job.description,
          requiredSkills: job.requiredSkills || [],
          owner: job.owner || "unknown",
          applicantCount: job.applicantCount || 0,
        }));
        if (!cancelled) {
          setJobs(formatted);
          localStorage.setItem("jobs", JSON.stringify(formatted));
        }
      } catch (e) {
        console.error("Failed to load jobs:", e);
        pushAlert("Failed to load job listings. Please try again.", "danger");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, pushAlert]);

  /** ---------- applications ---------- */
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userKey}_applications`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // write-through cache only when apps actually change
  useEffect(() => {
    localStorage.setItem(
      `${userKey}_applications`,
      JSON.stringify(applications)
    );
  }, [applications, userKey]);

  // fetch from backend + optional polling
  useEffect(() => {
    let cancelled = false;
    let timerId = null;

    const fetchApplications = async () => {
      try {
        const { data } = await api.get(`/api/applications/user`);
        const backendApps = Array.isArray(data) ? data : [];
        const formattedApps = backendApps.map((app) => ({
          id: app._id,
          jobId: app.jobId?._id || app.jobId,
          title: app.jobId?.title || "N/A",
          department: app.jobId?.department || "N/A",
          appliedOn: new Date(app.createdAt).toLocaleDateString(),
          status: app.status || "Pending",
          resumeUrl: app.resumeUrl || "",
          resumeStatus: app.resumeUrl ? "Uploaded" : " Not Uploaded",
        }));
        if (!cancelled) {
          // avoid state updates if equal (cheap compare length + id set)
          const prev = applications;
          const sameLength = prev.length === formattedApps.length;
          const sameIds =
            sameLength &&
            prev.every(
              (p, i) =>
                p.id === formattedApps[i]?.id &&
                p.status === formattedApps[i]?.status
            );
          if (!sameIds) setApplications(formattedApps);
        }
      } catch (e) {
        console.error("Failed to load user applications:", e);
      }
    };

    // initial fetch
    fetchApplications();
    // optional polling (30s)
    timerId = window.setInterval(fetchApplications, 30000);

    return () => {
      cancelled = true;
      if (timerId) window.clearInterval(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, userKey]); // do not depend on `applications` to avoid feedback loop

  /** ---------- profile (lazy init) ---------- */
  // kept for feature parity even if not used in render
  // eslint-disable-next-line no-unused-vars
  const [profile] = useState(() => {
    const saved = localStorage.getItem(`${userKey}_profile`);
    if (saved) return JSON.parse(saved);
    return {
      name: currentUser?.name || "User",
      email: currentUser?.email || "Not Available",
      department: currentUser?.department || "Not Set",
    };
  });

  /** ---------- filters ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // reduce re-computation pressure on big lists
  const deferredSearch = useDeferredValue(searchTerm);

  const filteredJobs = useMemo(() => {
    const s = deferredSearch.trim().toLowerCase();
    const dept = selectedDept;
    if (!jobs.length) return [];
    return jobs.filter((job) => {
      const title = job.title?.toLowerCase() || "";
      const department = job.department?.toLowerCase() || "";
      const matchesSearch = !s || title.includes(s) || department.includes(s);
      const matchesDept = dept === "All" || job.department === dept;
      return matchesSearch && matchesDept;
    });
  }, [deferredSearch, selectedDept, jobs]);

  /** ---------- skills & recommendations ---------- */
  const userSkills = useMemo(() => {
    try {
      const stored = localStorage.getItem(`${userKey}_skills`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [userKey]);

  /** robust skill normalizer: strings/arrays/objects -> tokens */
  const normalizeSkills = useCallback((value) => {
    if (value == null) return [];
    const asArray = Array.isArray(value)
      ? value
      : String(value).split(/[,\|\/;+]+/);
    const pick = (v) => {
      if (v == null) return [];
      if (typeof v === "string") return v.split(/[,\|\/;+]+/);
      if (typeof v === "object") {
        const raw = v.name ?? v.label ?? v.skill ?? v.value ?? "";
        return String(raw).split(/[,\|\/;+]+/);
      }
      return String(v).split(/[,\|\/;+]+/);
    };
    return asArray
      .flatMap(pick)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  const recommendedJobs = useMemo(() => {
    if (!userSkills?.length || !jobs.length) return [];
    const userTokens = normalizeSkills(userSkills);
    if (!userTokens.length) return [];
    const appSet = new Set(applications.map((a) => a.jobId));
    return jobs
      .map((job) => {
        const reqTokens = normalizeSkills(job.requiredSkills || []);
        const alreadyApplied = appSet.has(job.id);
        const titleLc = job.title?.toLowerCase?.() || "";
        const deptLc = job.department?.toLowerCase?.() || "";
        const skillMatches = reqTokens.filter((t) =>
          userTokens.includes(t)
        ).length;
        const fallbackMatches = userTokens.filter(
          (u) => titleLc.includes(u) || deptLc.includes(u)
        ).length;
        const score = skillMatches * 10 + fallbackMatches;
        return { job, score, alreadyApplied };
      })
      .filter((x) => !x.alreadyApplied && x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.job);
  }, [applications, jobs, normalizeSkills, userSkills]);

  /** ---------- apply flow ---------- */
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    resumeFile: null,
    coverLetter: "",
  });

  const openApply = useCallback(
    (job) => {
      const alreadyApplied = applications.some((app) => app.jobId === job.id);
      if (alreadyApplied) {
        pushAlert("You have already applied for this job.", "warning");
        return;
      }
      setSelectedJob(job);
      setShowModal(true);
    },
    [applications, pushAlert]
  );

  const fileReaderRef = useRef(null);

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === "resume" && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      fileReaderRef.current = reader;
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, resumeFile: reader.result })); // Base64 (as before)
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  useEffect(() => {
    // abort any pending FileReader work if modal closes/unmounts
    return () => {
      const r = fileReaderRef.current;
      if (r && r.readyState === 1 /* LOADING */) {
        try {
          r.abort();
        } catch {}
      }
    };
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;
      if (!selectedJob) {
        pushAlert("No job selected.", "warning");
        return;
      }
      const token = getToken();
      if (!token) {
        pushAlert("Please log in to apply for a job.", "warning");
        return;
      }

      try {
        setLoading(true);
        const payload = {
          jobId: selectedJob.id,
          coverLetter: formData.coverLetter,
          resumeUrl: formData.resumeFile,
        };
        const { data } = await api.post(`/api/applications/apply`, payload);
        pushAlert(
          `Application submitted successfully for: ${selectedJob.title}`,
          "success"
        );

        const newApplication = {
          id: data?.application?._id,
          jobId: selectedJob.id,
          title: selectedJob.title,
          department: selectedJob.department,
          applicant: currentUser.email,
          applicantName: currentUser.name,
          coverLetter: formData.coverLetter,
          resumeUrl: formData.resumeFile,
          status: "Pending",
          appliedOn: new Date().toLocaleDateString(),
        };

        setApplications((prev) => {
          const next = [...prev, newApplication];
          localStorage.setItem(`${userKey}_applications`, JSON.stringify(next));
          return next;
        });

        setFormData({ name: "", email: "", resumeFile: null, coverLetter: "" });
        setShowModal(false);
      } catch (err) {
        console.error("Application submit failed:", err);
        pushAlert("Failed to submit application. Please try again.", "danger");
      } finally {
        setLoading(false);
      }
    },
    [
      api,
      currentUser.email,
      currentUser.name,
      formData.coverLetter,
      formData.resumeFile,
      loading,
      selectedJob,
      userKey,
      pushAlert,
    ]
  );

  /** ---------- logout ---------- */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("current_user");
    navigate("/");
  }, [navigate]);

  const handleViewResume = useCallback(
    (url) => {
      if (!url) {
        pushAlert("No resume found for this applicant.", "warning");
        return;
      }
      setPreviewUrl(url);
      // Scroll smoothly to preview area
      window.requestAnimationFrame(() => {
        const preview = document.getElementById("resume-preview");
        if (preview) preview.scrollIntoView({ behavior: "smooth" });
      });
    },
    [pushAlert]
  );

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-semibold">NITC Job Portal</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link active" to="/dashboard-user">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile-user">
                  Profile
                </Link>
              </li>
              <li className="nav-item d-flex align-items-center">
                <NotificationBell
                  notifications={notifications}
                  onClear={clearNotifications}
                />
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-link nav-link text-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Dashboard Layout */}
      <div className="container-fluid py-4 flex-grow-1">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 mb-4">
            <div className="card shadow-sm border-0 mb-3 p-3">
              <h5 className="text-primary">Welcome, {userName}</h5>
              <p className="text-muted small">
                Browse jobs and apply online easily.
              </p>
            </div>
            <div className="card text-center shadow-sm border-0 mb-3 p-3">
              <h6>Applications Made</h6>
              <h3 className="text-primary fw-bold">{applications.length}</h3>
            </div>
            <div className="card text-center shadow-sm border-0 mb-3 p-3">
              <h6>Shortlisted</h6>
              <h3 className="text-success fw-bold">
                {applications.filter((a) => a.status === "Accepted").length}
              </h3>
            </div>
            <div className="card text-center shadow-sm border-0 p-3">
              <h6>Pending</h6>
              <h3 className="text-warning fw-bold">
                {applications.filter((a) => a.status === "Pending").length}
              </h3>
            </div>
          </div>

          {/* Main Section */}
          <div className="col-md-9">
            {/* Recommended Jobs */}
            {userSkills.length > 0 && recommendedJobs.length > 0 && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light fw-semibold fs-5">
                  Recommended Jobs for You
                </div>
                <div className="card-body">
                  <div className="text-muted small mb-2">
                    Recommendations improve when admins specify{" "}
                    <em>Required Skills</em>.
                  </div>
                  <div className="row">
                    {recommendedJobs.map((job) => (
                      <div className="col-md-6 mb-3" key={job.id}>
                        <div className="card h-100 border shadow-sm">
                          <div className="card-body">
                            <h6 className="fw-bold text-primary">
                              {job.title}
                            </h6>
                            <p className="text-muted small mb-1">
                              {job.department}
                            </p>
                            <p className="mb-2">
                              <strong>Deadline:</strong> {job.deadline}
                            </p>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openApply(job)}
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Available Jobs */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light fw-semibold fs-5 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                <span>Available Jobs</span>
                <div className="d-flex flex-wrap gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title or department"
                    style={{ minWidth: "200px" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="form-select"
                    style={{ minWidth: "180px" }}
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
              </div>

              <div className="card-body">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Deadline</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">
                          No jobs found.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => {
                        const applied = applications.some(
                          (app) => app.jobId === job.id
                        );
                        return (
                          <tr key={job.id}>
                            <td>{job.title}</td>
                            <td>{job.deadline}</td>
                            <td>{job.department}</td>
                            <td className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => handleViewJob(job)}
                              >
                                View
                              </button>
                              {applied ? (
                                <button
                                  className="btn btn-success btn-sm"
                                  disabled
                                >
                                  Applied
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => openApply(job)}
                                >
                                  Apply
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Application History */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light fw-semibold fs-5">
                Application History
              </div>
              <div className="card-body">
                {applications.length === 0 ? (
                  <p className="text-muted text-center mb-0">
                    No applications submitted yet.
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Job Title</th>
                          <th>Department</th>
                          <th>Applied On</th>
                          <th>Status</th>
                          <th>Resume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app.id || app.jobId}>
                            <td>{app.title}</td>
                            <td>{app.department}</td>
                            <td>{app.appliedOn}</td>
                            <td>
                              <span
                                className={`badge bg-${
                                  app.status === "Accepted"
                                    ? "success"
                                    : app.status === "Rejected"
                                    ? "danger"
                                    : "warning text-dark"
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.resumeUrl ? (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleViewResume(app.resumeUrl)}
                                >
                                  View
                                </Button>
                              ) : (
                                <span className="text-muted small">
                                  No resume
                                </span>
                              )}
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

      {/* View Job Details Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewJob ? (
            <>
              <h5 className="fw-bold text-primary mb-2">{viewJob.title}</h5>
              <p className="mb-1">
                <strong>Department:</strong> {viewJob.department}
              </p>
              <p className="mb-1">
                <strong>Deadline:</strong> {viewJob.deadline}
              </p>
              <hr />
              <p>
                <strong>Description:</strong>
              </p>
              <p className="text-muted">{viewJob.description}</p>
              <p>
                <strong>Qualifications:</strong>
              </p>
              <p className="text-muted">{viewJob.qualifications}</p>
              <p>
                <strong>Required Skills:</strong>
              </p>
              <p className="text-muted">
                {viewJob.requiredSkills && viewJob.requiredSkills.length > 0
                  ? viewJob.requiredSkills.join(", ")
                  : "Not specified"}
              </p>
            </>
          ) : (
            <p className="text-muted">No job details available.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Apply Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Apply for {selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload Resume</Form.Label>
              <Form.Control
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cover Letter</Form.Label>
              <Form.Control
                as="textarea"
                name="coverLetter"
                rows={3}
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Write a short note..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* page-scoped alert host */}
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
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">{t.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setAlerts((a) => a.filter((x) => x.id !== t.id))}
                aria-label="Close"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-primary text-white text-center py-3 mt-auto">
        <small>© 2025 NITC Job Portal User. All rights reserved.</small>
      </footer>
    </div>
  );
});

export default UserDashboard;
