import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import axios from "axios";

const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
axios.defaults.baseURL = apiBase;
if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

const UserProfile = React.memo(function UserProfile() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  /** ---------------- Alerts (Bootstrap Toasts) ---------------- */
  const [alerts, setAlerts] = useState([]);
  const pushAlert = useCallback((message, variant = "info", timeout = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts((prev) => [...prev, { id, message, variant }]);
    if (timeout)
      setTimeout(() => {
        setAlerts((prev) => prev.filter((t) => t.id !== id));
      }, timeout);
  }, []);

  /** ---------------- Load Current User ---------------- */
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("current_user") || "{}"),
    []
  );
  const allUsers = useMemo(
    () => JSON.parse(localStorage.getItem("users") || "[]"),
    []
  );

  const currentUser = useMemo(() => {
    return (
      allUsers.find((u) => u.email === storedUser.email) ||
      storedUser ||
      {}
    );
  }, [allUsers, storedUser]);

  const userKey = currentUser?.email || "guest_user";

  /** ---------------- Profile State ---------------- */
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(`${userKey}_profile`);
      if (saved) return JSON.parse(saved);
    } catch {}
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

  /** ---------------- Edit Profile Modal ---------------- */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    department: user.department,
  });

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
    async (e) => {
      e.preventDefault();
      const skill = newSkill.trim();
      if (!skill) {
        pushAlert("Please enter a valid skill.", "warning");
        return;
      }

      const formattedSkill =
        skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();

      try {
        const res = await axios.post("/api/users/skills", {
          skill: formattedSkill,
        });
        setSkills(res.data?.skills || [...skills, formattedSkill]);
        pushAlert(`Skill "${formattedSkill}" added.`, "success");
      } catch (err) {
        console.error("Add skill error:", err);
        pushAlert("Failed to add skill.", "danger");
      }
      setNewSkill("");
      setShowSkillModal(false);
    },
    [newSkill, skills, pushAlert]
  );

  const handleRemoveSkill = useCallback(
    async (skillToRemove) => {
      try {
        const res = await axios.delete(`/api/users/skills/${skillToRemove}`);
        setSkills(res.data?.skills || skills.filter((s) => s !== skillToRemove));
        pushAlert(`Skill "${skillToRemove}" removed.`, "info");
      } catch (err) {
        console.error("Delete skill error:", err);
        pushAlert("Failed to delete skill.", "danger");
      }
    },
    [skills, pushAlert]
  );

  const handleEditSave = useCallback(
    async (e) => {
      e.preventDefault();
      const { name, department } = editForm;
      if (!name.trim() || !department.trim()) {
        pushAlert("All fields are required!", "warning");
        return;
      }

      try {
        const res = await axios.put("/api/users/profile", {
          name,
          department,
        });
        const updatedUser = res.data?.user || { ...user, name, department };

        setUser(updatedUser);
        localStorage.setItem(`${userKey}_profile`, JSON.stringify(updatedUser));

        const storedUser = JSON.parse(
          localStorage.getItem("current_user") || "{}"
        );
        const mergedUser = {
          ...storedUser,
          name: updatedUser.name,
          department: updatedUser.department,
        };
        localStorage.setItem("current_user", JSON.stringify(mergedUser));

        pushAlert("Profile updated successfully.", "success");
        setShowEditModal(false);
      } catch (err) {
        console.error("Update error:", err);
        pushAlert("Failed to update profile.", "danger");
      }
    },
    [editForm, userKey, pushAlert, user]
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-primary mb-0">User Profile</h4>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowEditModal(true)}
            >
              ✏️ Edit
            </Button>
          </div>

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
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {skill}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      ✖
                    </Button>
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
              + Add Skill
            </Button>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal show={showSkillModal} onHide={() => setShowSkillModal(false)} centered>
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
            <Button variant="secondary" onClick={() => setShowSkillModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Add Skill
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                value={editForm.department}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Toast Host */}
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

      {/* Footer */}
      <footer className="bg-primary text-white text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()} NITC Job Portal User. All rights
          reserved.
        </small>
      </footer>
    </div>
  );
});

export default UserProfile;
