import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";


const RequestAdmin = () => {
      const navigate = useNavigate();
    
  const [form, setForm] = useState({ name: "", email: "", department: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/request-admin`, form);
      setMessage("✅ Request submitted successfully!");
    navigate("/login-admin");

    } catch (err) {
      setMessage("❌ Failed to submit request");
    }
  };

  return (
    <Container className="mt-5">
      <h3>Request for Admin Access</h3>
      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control name="name" value={form.name} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={form.email} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Department</Form.Label>
          <Form.Control name="department" value={form.department} onChange={handleChange} required />
        </Form.Group>
        <Button variant="primary" type="submit">Submit Request</Button>
      </Form>
      {message && <p className="mt-3">{message}</p>}
    </Container>
  );
};

export default RequestAdmin;
