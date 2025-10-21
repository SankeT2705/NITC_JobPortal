import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Table, Button, Container, Spinner, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const SuperAdminDashboard = React.memo(function SuperAdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  //Fetch both pending requests & current admins (memoized for efficiency)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setActionMessage("");

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/superadmin/requests`,
        { timeout: 8000 }
      );

      if (data) {
        const pending = (data.requests || []).filter(
          (req) => req.status === "Pending"
        );
        setRequests(pending);
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      setActionMessage("⚠️ Failed to load data. Please check your network.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //Handle Accept/Reject
  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`))
      return;
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/superadmin/handle/${id}`,
        { action }
      );
      setActionMessage(data?.message || `✅ Request ${action}ed successfully.`);
      await fetchData();
    } catch (err) {
      console.error("❌ Error handling request:", err);
      setActionMessage("❌ Failed to update admin request.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Delete Admin
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      setLoading(true);
      const { data } = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/superadmin/delete-admin/${id}`
      );
      setActionMessage(data?.message || "✅ Admin deleted successfully.");
      await fetchData();
    } catch (err) {
      console.error("❌ Error deleting admin:", err);
      setActionMessage("⚠️ Failed to delete admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-semibold" to="/">
            NITC Job Portal
          </Link>
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
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="#">
                  Super Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Dashboard */}
      <Container className="flex-grow-1 py-5">
        <Card className="shadow-lg border-0 p-4">
          <h3 className="fw-bold text-primary mb-4 text-center">
            Super Admin Dashboard
          </h3>

          {loading && (
            <div className="text-center my-3">
              <Spinner animation="border" role="status" />
            </div>
          )}

          {actionMessage && (
            <p
              className={`text-center fw-semibold ${
                actionMessage.startsWith("✅")
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {actionMessage}
            </p>
          )}

          {/* Pending Admin Requests */}
          <h5 className="mt-4 text-primary">Pending Admin Requests</h5>
          <Table
            striped
            bordered
            hover
            responsive
            className="align-middle text-center mt-3"
          >
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-muted py-3">
                    No pending admin requests.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.name}</td>
                    <td>{req.email}</td>
                    <td>{req.department}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAction(req._id, "accept")}
                        disabled={loading}
                        className="me-2"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleAction(req._id, "reject")}
                        disabled={loading}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Current Admins */}
          <h5 className="mt-5 text-primary">Current Admins</h5>
          <Table
            striped
            bordered
            hover
            responsive
            className="align-middle text-center mt-3"
          >
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-muted py-3">
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((adm) => (
                  <tr key={adm._id}>
                    <td>{adm.name}</td>
                    <td>{adm.email}</td>
                    <td>{adm.department}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(adm._id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <small>
          © {new Date().getFullYear()} NIT Calicut — Job Portal | Designed by
          Team 6
        </small>
      </footer>
    </div>
  );
});

export default SuperAdminDashboard;