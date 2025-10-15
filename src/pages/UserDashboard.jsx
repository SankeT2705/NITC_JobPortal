import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import NotificationBell from "../components/NotificationBell";
import axios from "axios";

const UserDashboard = () => {
  const navigate = useNavigate();

  // ---------------- CURRENT USER ----------------
  const storedUser = JSON.parse(localStorage.getItem("current_user") || "{}");
  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");

  const currentUser =
    allUsers.find((u) => u.email === storedUser.email) || storedUser;

  const userKey = currentUser?.email || "guest_user";
  const userName = currentUser?.name || "User";

  // ---------------- NOTIFICATIONS ----------------
const [notifications, setNotifications] = useState([]);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      axios.defaults.baseURL = "${process.env.REACT_APP_API_URL}";
      const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
      if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (currentUser?.email) {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/notifications/${currentUser.email}`);
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error("❌ Failed to load notifications:", err);
    }
  };

  fetchNotifications();
}, [currentUser?.email]);

// ✅ Clear notifications in backend
const clearNotifications = async () => {
  try {
    axios.defaults.baseURL ="${process.env.REACT_APP_API_URL}";
    const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    await axios.delete(`${process.env.REACT_APP_API_URL}/api/notifications/${currentUser.email}`);
    setNotifications([]);
  } catch (err) {
    console.error("❌ Failed to clear notifications:", err);
  }
};

// ✅ Fetch updated applications from backend
useEffect(() => {
  const fetchApplications = async () => {
    try {
      axios.defaults.baseURL = "${process.env.REACT_APP_API_URL}";
      const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
      if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/applications/user`);
      const backendApps = res.data || [];

      // Format apps to match local UI fields
      const formattedApps = backendApps.map((app) => ({
        id: app._id,
        jobId: app.jobId?._id || app.jobId,
        title: app.jobId?.title || "N/A",
        department: app.jobId?.department || "N/A",
        appliedOn: new Date(app.createdAt).toLocaleDateString(),
        status: app.status || "Pending",
        resumeUrl: app.resumeUrl || "",
        resumeStatus: app.resumeUrl ? "✅ Uploaded" : "❌ Not Uploaded",
      }));

      setApplications(formattedApps);
      localStorage.setItem(`${userKey}_applications`, JSON.stringify(formattedApps));
    } catch (err) {
      console.error("❌ Failed to load user applications:", err);
    }
  };

  fetchApplications();

  // ✅ Optional auto-refresh every 30s
  const interval = setInterval(fetchApplications, 30000);
  return () => clearInterval(interval);
}, [userKey]);


  // ---------------- USER PROFILE ----------------
  const [profile] = useState(() => {
    const saved = localStorage.getItem(`${userKey}_profile`);
    if (saved) return JSON.parse(saved);

    return {
      name: currentUser?.name || "User",
      email: currentUser?.email || "Not Available",
      department: currentUser?.department || "Not Set",
    };
  });

  // ---------------- JOB DATA ----------------
  const [jobs, setJobs] = useState([]);

 useEffect(() => {
  const fetchJobs = async () => {
    try {
      // ✅ Set base URL (backend)
      axios.defaults.baseURL = "${process.env.REACT_APP_API_URL}";

      // ✅ Optional: Add token if user logged in
      const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
      if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`);
      const backendJobs = res.data || [];

      // ✅ Normalize job fields for frontend consistency
      const formatted = backendJobs.map((job) => ({
        id: job._id, // your local code uses "id"
        title: job.title,
        department: job.department,
        deadline: job.deadline?.split("T")[0] || "N/A",
        qualifications: job.qualifications,
        description: job.description,
        requiredSkills: job.requiredSkills || [],
        owner: job.owner || "unknown",
        applicantCount: job.applicantCount || 0,
      }));

      setJobs(formatted);
      localStorage.setItem("jobs", JSON.stringify(formatted)); // optional caching
    } catch (err) {
      console.error("❌ Failed to load jobs:", err);
      alert("⚠️ Failed to load job listings. Please try again.");
    }
  };

  fetchJobs();
}, []);

  // ---------------- FILTERS ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept =
        selectedDept === "All" || job.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [searchTerm, selectedDept, jobs]);

  // ---------------- APPLICATION HISTORY ----------------
  const [applications, setApplications] = useState(() => {
    const saved = localStorage.getItem(`${userKey}_applications`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      `${userKey}_applications`,
      JSON.stringify(applications)
    );
  }, [applications, userKey]);

  // ---------------- USER SKILLS ----------------
  const userSkills = useMemo(() => {
    const stored = localStorage.getItem(`${userKey}_skills`);
    return stored ? JSON.parse(stored) : [];
  }, [userKey]);

  // ---------------- RECOMMENDED JOBS ----------------
  const recommendedJobs = useMemo(() => {
    if (!userSkills || userSkills.length === 0) return [];

    return jobs
      .map((job) => {
        const reqSkills = job.requiredSkills || [];
        const alreadyApplied = applications.some((a) => a.jobId === job.id);

        const skillMatches = reqSkills.filter((s) =>
          userSkills.some((u) => u.toLowerCase() === s.toLowerCase())
        ).length;

        const fallbackMatches = userSkills.filter(
          (u) =>
            job.title.toLowerCase().includes(u.toLowerCase()) ||
            job.department.toLowerCase().includes(u.toLowerCase())
        ).length;

        const totalScore = skillMatches * 10 + fallbackMatches;

        return { job, score: totalScore, alreadyApplied };
      })
      .filter((j) => !j.alreadyApplied && j.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((j) => j.job);
  }, [jobs, userSkills, applications]);

  // ---------------- APPLY FORM ----------------
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    resumeFile: null,
    coverLetter: "",
  });

  const handleApply = (job) => {
    const alreadyApplied = applications.some((app) => app.jobId === job.id);
    if (alreadyApplied) {
      alert("You have already applied for this job.");
      return;
    }
    setSelectedJob(job);
    setShowModal(true);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (!selectedJob) {
      alert("⚠️ No job selected.");
      return;
    }

    const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
    if (!token) {
      alert("Please log in to apply for a job.");
      return;
    }

    axios.defaults.baseURL = "${process.env.REACT_APP_API_URL}";
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // ✅ Prepare backend payload
    const payload = {
      jobId: selectedJob.id,
      coverLetter: formData.coverLetter,
      resumeUrl: formData.resumeFile, // base64 string
    };

    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/applications/apply`, payload);
    console.log("✅ Application submitted:", res.data);

    alert(`✅ Application submitted successfully for: ${selectedJob.title}`);

    // ✅ Update frontend state for instant feedback
    const newApplication = {
      id: res.data.application._id,
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

    const nextApps = [...applications, newApplication];
    setApplications(nextApps);
    localStorage.setItem(`${userKey}_applications`, JSON.stringify(nextApps));

    // ✅ Reset form and close modal
    setFormData({ name: "", email: "", resumeFile: null, coverLetter: "" });
    setShowModal(false);
  } catch (err) {
    console.error("❌ Application submit failed:", err);
    alert("❌ Failed to submit application. Please try again.");
  }
};

 // Handle input change
 const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "resume" && files && files[0]) {
    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, resumeFile: reader.result })); // Base64 data URL
    };

    reader.readAsDataURL(file); // Converts file to Base64
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};


  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("current_user");
    navigate("/");
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-semibold">
            NITC Job Portal
          </span>

          <ul className="navbar-nav ms-auto">
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
            <li className="nav-item">
              <button
                className="btn btn-link nav-link text-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
            <li className="nav-item d-flex align-items-center me-3">
              <NotificationBell
                notifications={notifications}
                onClear={clearNotifications}
              />
            </li>
          </ul>
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
                    💡 Recommendations improve when admins specify{" "}
                    <em>Required Skills</em>.
                  </div>
                  <div className="row">
                    {recommendedJobs.map((job) => (
                      <div className="col-md-6 mb-3" key={job.id}>
                        <div className="card h-100 border shadow-sm">
                          <div className="card-body">
                            <h6 className="fw-bold text-primary">{job.title}</h6>
                            <p className="text-muted small mb-1">{job.department}</p>
                            <p className="mb-2">
                              <strong>Deadline:</strong> {job.deadline}
                            </p>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleApply(job)}
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
                            <td>
                              {applied ? (
                                <button className="btn btn-success btn-sm" disabled>
                                  Applied
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleApply(job)}
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
                        {applications.map((app, idx) => (
                          <tr key={idx}>
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
    <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
      📄 View Resume
    </a>
  ) : (
    "❌ Not Uploaded"
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
            <Button type="submit" variant="primary">
              Submit Application
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Footer */}
      <footer className="bg-primary text-white text-center py-3 mt-auto">
        <small>© 2025 NITC Job Portal User. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default UserDashboard;
