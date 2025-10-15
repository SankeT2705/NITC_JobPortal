import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create Context
const AuthContext = createContext();

// Custom Hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("nitc_user");
    return saved ? JSON.parse(saved) : null;
  });

  // ✅ Setup axios baseURL (connect to backend)
  axios.defaults.baseURL = "${process.env.REACT_APP_API_URL}"; // your backend URL

  // ✅ Set Authorization header globally
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user]);

  // ✅ Login (for user or admin)
  const login = async (role, email, password) => {
    try {
      // Both users & admins use the same route
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });

      const loggedInUser = res.data;

      // ✅ Ensure role matches
      if (role === "admin" && loggedInUser.role !== "admin") {
        throw new Error("This account is not an admin.");
      }

      // ✅ Save to state + localStorage
      setUser(loggedInUser);
      localStorage.setItem("nitc_user", JSON.stringify(loggedInUser));

      // Compatibility keys
      if (loggedInUser.role === "admin") {
        localStorage.setItem("admin_user", JSON.stringify(loggedInUser));
      } else {
        localStorage.setItem("current_user", JSON.stringify(loggedInUser));
      }

      // Set JWT header for future requests
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${loggedInUser.token}`;

      return loggedInUser;
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ Register (for both)
  const register = async (data, role = "user") => {
    try {
      const payload = { ...data, role };
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, payload);
      return res.data;
    } catch (err) {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("nitc_user");
    localStorage.removeItem("current_user");
    localStorage.removeItem("admin_user");
    delete axios.defaults.headers.common["Authorization"];
  };

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  return (
    <AuthContext.Provider value={{ user, isAdmin, isUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
