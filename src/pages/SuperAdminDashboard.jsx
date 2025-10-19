import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Container, Spinner } from "react-bootstrap";

const SuperAdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch both pending requests & current admins
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/superadmin/requests`);
      if (res.data) {
        // Only keep pending requests
        const pending = (res.data.requests || []).filter(req => req.status === "Pending");
        setRequests(pending);
        setAdmins(res.data.admins || []);
      }
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      alert("⚠️ Failed to load data. Please check your network or backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Handle accept/reject actions
  const handleAction = async (id, action) => {
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/superadmin/handle/${id}`, { action });

      if (res.data?.message) {
        alert(res.data.message);
      }

      // ✅ Refresh data after update
      await fetchData();
    } catch (err) {
      console.error("❌ Error handling request:", err);
      alert("❌ Failed to update admin request.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle deleting an admin
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await axios.delete(`${process.env.REACT_APP_API_URL}/api/superadmin/delete-admin/${id}`);
      if (res.data?.message) {
        alert(res.data.message);
      }
      await fetchData();
    } catch (err) {
      console.error("❌ Error deleting admin:", err);
      alert("⚠️ Failed to delete admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4">Super Admin Dashboard</h3>

      {loading && (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" />
        </div>
      )}

      {/* Pending Admin Requests */}
      <h5 className="mt-4">Pending Admin Requests</h5>
      <Table striped bordered hover responsive>
        <thead>
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
              <td colSpan="4" className="text-center text-muted py-3">
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
                  >
                    Accept
                  </Button>{" "}
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
      <h5 className="mt-5">Current Admins</h5>
      <Table striped bordered hover responsive>
        <thead>
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
              <td colSpan="4" className="text-center text-muted py-3">
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
    </Container>
  );
};

export default SuperAdminDashboard;
