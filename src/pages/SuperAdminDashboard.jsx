import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { Table, Button, Container, Spinner, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

/** ==============================
 *   AXIOS CLIENT (Reusable)
 *  ============================== */
const useAxiosClient = () => {
  const apiBase = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:5000",
    []
  );
  return useMemo(
    () =>
      axios.create({
        baseURL: apiBase,
        timeout: 10000,
      }),
    [apiBase]
  );
};

const SuperAdminDashboard = React.memo(function SuperAdminDashboard() {
  const api = useAxiosClient();

  /** ====== STATE ====== */
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // For controlled refresh

  /** ====== TOAST ALERTS ====== */
  const pushAlert = useCallback((message, variant = "info", timeout = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setAlerts((prev) => [...prev, { id, message, variant }]);
    if (timeout)
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, timeout);
  }, []);

  /** ====== FETCH REQUESTS + ADMINS ====== */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/superadmin/requests");

      if (data) {
        const pending = (data.requests || []).filter(
          (req) => req.status === "Pending"
        );
        setRequests(pending);
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      pushAlert(
        "⚠️ Failed to load data. Please check your network or server.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  }, [api, pushAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  /** ====== HANDLE ACCEPT / REJECT ====== */
  const handleAction = useCallback(
    async (id, action) => {
      try {
        setLoading(true);
        const { data } = await api.post(`/api/superadmin/handle/${id}`, {
          action,
        });
        pushAlert(
          data?.message || `✅ Request ${action}ed successfully.`,
          "success"
        );
        setRefreshKey((k) => k + 1);
      } catch (err) {
        console.error("❌ Error handling request:", err);
        pushAlert("❌ Failed to update admin request.", "danger");
      } finally {
        setLoading(false);
      }
    },
    [api, pushAlert]
  );

  /** ====== HANDLE DELETE ADMIN ====== */
  const handleDelete = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const { data } = await api.delete(
          `/api/superadmin/delete-admin/${id}`
        );
        pushAlert(data?.message || "✅ Admin deleted successfully.", "success");
        setRefreshKey((k) => k + 1);
      } catch (err) {
        console.error("❌ Error deleting admin:", err);
        pushAlert("⚠️ Failed to delete admin.", "danger");
      } finally {
        setLoading(false);
      }
    },
    [api, pushAlert]
  );

  /** ====== RENDER ====== */
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
          <div
            className="collapse navbar-collapse justify-content-end"
            id="navbarNav"
          >
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

      {/* Toast Notifications */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1080 }}>
        {alerts.map((t) => (
          <div
            key={t.id}
            className={`toast show align-items-center text-white bg-${
              t.variant === "danger"
                ? "danger"
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
