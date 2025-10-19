import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";

// Create Context
const AuthContext = createContext(null);

// Custom Hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  /** ==============================
   *  Initialization
   *  ============================== */
  const apiBase = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:5000",
    []
  );

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("nitc_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  /** ==============================
   *  Axios Setup
   *  ============================== */
  useEffect(() => {
    axios.defaults.baseURL = apiBase;
  }, [apiBase]);

  // ✅ Keep Authorization token synced globally
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user]);

  /** ==============================
   *  Login (User / Admin)
   *  ============================== */
  const login = useCallback(
    async (role, email, password) => {
      try {
        const res = await axios.post(`${apiBase}/api/auth/login`, {
          email,
          password,
        });
        const loggedInUser = res.data;

        if (role === "admin" && loggedInUser.role !== "admin") {
          throw new Error("This account is not an admin.");
        }

        // ✅ Persist login data
        setUser(loggedInUser);
        localStorage.setItem("nitc_user", JSON.stringify(loggedInUser));

        // Compatibility keys
        if (loggedInUser.role === "admin") {
          localStorage.setItem("admin_user", JSON.stringify(loggedInUser));
        } else {
          localStorage.setItem("current_user", JSON.stringify(loggedInUser));
        }

        // ✅ Attach JWT token globally
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${loggedInUser.token}`;

        return loggedInUser;
      } catch (err) {
        console.error("❌ Login failed:", err.response?.data || err.message);
        throw err;
      }
    },
    [apiBase]
  );

  /** ==============================
   *  Register (User / Admin)
   *  ============================== */
  const register = useCallback(
    async (data, role = "user") => {
      try {
        const payload = { ...data, role };
        const res = await axios.post(`${apiBase}/api/auth/register`, payload);
        return res.data;
      } catch (err) {
        console.error("❌ Registration failed:", err.response?.data || err.message);
        throw err;
      }
    },
    [apiBase]
  );

  /** ==============================
   *  Logout
   *  ============================== */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("nitc_user");
    localStorage.removeItem("current_user");
    localStorage.removeItem("admin_user");
    delete axios.defaults.headers.common["Authorization"];
  }, []);

  /** ==============================
   *  Role Helpers
   *  ============================== */
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  /** ==============================
   *  Memoized Context Value
   *  ============================== */
  const value = useMemo(
    () => ({
      user,
      isAdmin,
      isUser,
      login,
      logout,
      register,
    }),
    [user, isAdmin, isUser, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
