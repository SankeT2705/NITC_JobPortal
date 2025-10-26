
import axios from "axios";

export const checkAdminValidity = async () => {
  const token = JSON.parse(localStorage.getItem("nitc_user") || "{}")?.token;
  if (!token) return false;

  try {
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const res = await axios.get(`${apiBase}/api/auth/verify-admin`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    });
    return res.status === 200 && res.data.valid === true;
  } catch (err) {
    console.warn("Admin session invalid or deleted:", err.response?.status);
    return false;
  }
};
