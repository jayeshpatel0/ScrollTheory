
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  adminLogin,
  getAdminProfile,
} from "../services/adminApi";

const AdminAuthContext = createContext(null);

const TOKEN_KEY = "scrolltheory_admin_token";

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        const result = await getAdminProfile(token);

        if (active) {
          setAdmin(result.admin);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);

        if (active) {
          setAdmin(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const result = await adminLogin(email, password);

    if (!result.token || result.admin?.role !== "admin") {
      throw new Error("Invalid login response.");
    }

    localStorage.setItem(TOKEN_KEY, result.token);
    setAdmin(result.admin);

    return result;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider."
    );
  }

  return context;
}
