import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const UserProfile = React.memo(function UserProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  /** ---------------- Load Current User (memoized) ---------------- */
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("current_user") || "{}"),
    []
  );
  const allUsers = useMemo(
    () => JSON.parse(localStorage.getItem("users") || "[]"),
    []
  );

  const currentUser = useMemo(() => {
    return allUsers.find((u) => u.email === storedUser.email) || storedUser || {};
  }, [allUsers, storedUser]);

  const userKey = currentUser?.email || "guest_user";

  /** ---------------- Profile State ---------------- */
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userKey}_profile`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore parse errors
    }
    return {
      name: currentUser?.name || "User",
      email: currentUser?.email || "Not Available",
      department: currentUser?.department || "Not Set",
    };
  });

  /** ---------------- Skills ---------------- */
  const [skills, setSkills] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userKey}_skills`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newSkill, setNewSkill] = useState("");
  const [showSkillModal, setShowSkillModal] = useState(false);

  /** ---------------- Persist Profile & Skills ---------------- */
  useEffect(() => {
    try {
      localStorage.setItem(`${userKey}_profile`, JSON.stringify(user));
    } catch {}
  }, [user, userKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${userKey}_skills`, JSON.stringify(skills));
    } catch {}
  }, [skills, userKey]);

  /** ---------------- Handlers ---------------- */
  const handleAddSkill = useCallback(
    (e) => {
      e.preventDefault();
      const skill = newSkill.trim();
      if (!skill) return;
      if (!skills.includes(skill)) {
        setSkills((prev) => [...prev, skill]);
      }
      setNewSkill("");
      setShowSkillModal(false);
    },
    [newSkill, skills]
  );

  const handleLogout = useCallback(() => {
    logout();
    const keysToRemove = [
      "current_user",
      `${userKey}_profile`,
      `${userKey}_skills`,
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    navigate("/");
  }, [logout, navigate, userKey]);

  /** ---------------- Render ---------------- */
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-semibold">
            NITC Job Portal – {user.name}
          </span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard-user">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/profile-user">
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
            </ul>
          </div>
        </div>
      </nav>

      {/* Profile Card */}
      <div className="container py-5 flex-grow-1">
        <div
          className="card shadow-lg border-0 p-4 mx-auto"
          style={{ maxWidth: "600px", borderRadius: "16px" }}
        >
          <h4 className="fw-bold text-primary mb-4">User Profile</h4>
          <div className="mb-3">
            <p className="mb-1">
              <strong>Full Name:</strong> {user.name}
            </p>
            <p className="mb-1">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="mb-1">
              <strong>Department:</strong> {user.department}
            </p>
          </div>

          <hr />

          <div className="mt-3">
            <h5 className="fw-semibold mb-2">Skills</h5>
            {skills.length > 0 ? (
              <ul className="list-group list-group-flush mb-3">
                {skills.map((skill, index) => (
                  <li key={index} className="list-group-item">
                    {skill}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No skills added yet.</p>
            )}
            <Button
              variant="success"
              className="mt-2 fw-semibold"
              onClick={() => setShowSkillModal(true)}
            >
              Add Skills
            </Button>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal
        show={showSkillModal}
        onHide={() => setShowSkillModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Skill</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSkill}>
          <Modal.Body>
            <Form.Control
              type="text"
              placeholder="Enter a skill (e.g. Python)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              required
              autoFocus
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowSkillModal(false)}
            >
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Add Skill
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Footer */}
      <footer className="bg-primary text-white text-center py-3 mt-auto">
        <small>© {new Date().getFullYear()} NITC Job Portal User. All rights reserved.</small>
      </footer>
    </div>
  );
});

export default UserProfile;
