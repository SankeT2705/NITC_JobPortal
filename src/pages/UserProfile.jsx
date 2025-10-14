import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ✅ Load current_user and refresh from users list for accuracy
  const storedUser = JSON.parse(localStorage.getItem("current_user") || "{}");
  const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
  const currentUser =
    allUsers.find((u) => u.email === storedUser.email) || storedUser;

  const userKey = currentUser?.email || "guest_user";

  // ✅ Load user profile from localStorage or fallback to registered info
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(`${userKey}_profile`);
    if (saved) return JSON.parse(saved);
    return {
      name: currentUser?.name || "User",
      email: currentUser?.email || "Not Available",
      department: currentUser?.department || "Not Set",
    };
  });

  // ✅ Load and manage user skills
  const [skills, setSkills] = useState(() => {
    const saved = localStorage.getItem(`${userKey}_skills`);
    return saved ? JSON.parse(saved) : [];
  });

  const [newSkill, setNewSkill] = useState("");
  const [showSkillModal, setShowSkillModal] = useState(false);

  // ✅ Keep profile updated in localStorage
  useEffect(() => {
    localStorage.setItem(`${userKey}_profile`, JSON.stringify(user));
  }, [user, userKey]);

  // ✅ Keep skills synced
  useEffect(() => {
    localStorage.setItem(`${userKey}_skills`, JSON.stringify(skills));
  }, [skills, userKey]);

  // ✅ Add new skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim()) {
      setSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
      setShowSkillModal(false);
    }
  };

  // ✅ Logout: clear all related keys
  const handleLogout = () => {
    logout(); // from AuthContext (clears nitc_user)
    localStorage.removeItem("current_user");
    localStorage.removeItem(`${userKey}_profile`);
    localStorage.removeItem(`${userKey}_skills`);
    navigate("/");
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-4">
        <div className="container-fluid">
          <span className="navbar-brand fw-semibold">
            NITC Job Portal – {user.name}
          </span>
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
      </nav>

      {/* Profile Card */}
      <div className="container py-5 flex-grow-1">
        <div
          className="card shadow-sm border-0 p-4 mx-auto"
          style={{ maxWidth: "600px" }}
        >
          <h4 className="fw-bold text-primary mb-3">User Profile</h4>
          <p>
            <strong>Full Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          

          <div className="mt-4">
            <h5>Skills:</h5>
            <ul>
              {skills.length > 0 ? (
                skills.map((skill, index) => <li key={index}>{skill}</li>)
              ) : (
                <p className="text-muted">No skills added yet.</p>
              )}
            </ul>
            <Button
              variant="success"
              className="mt-2"
              onClick={() => setShowSkillModal(true)}
            >
              Add Skills
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
        <small>© 2025 NITC Job Portal User. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default UserProfile;
