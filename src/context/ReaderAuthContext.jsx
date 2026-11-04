
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const ReaderAuthContext = createContext(null);


const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://scrolltheory.onrender.com"
).replace(/\/+$/, "");


export function ReaderAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load authenticated reader profile
  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("readerToken");

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/reader/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Session expired");
      }

      const reader = data.user || data.reader || null;
      setUser(reader);

      return reader;
    } catch (error) {
      localStorage.removeItem("readerToken");
      setUser(null);
      throw error;
    }
  }, []);

  // Initial session check
  useEffect(() => {
    let active = true;

    async function loadReader() {
      try {
        const token = localStorage.getItem("readerToken");

        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_URL}/api/reader/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Session expired");
        }

        if (active) {
          setUser(data.user || data.reader || null);
        }
      } catch (error) {
        localStorage.removeItem("readerToken");

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReader();

    return () => {
      active = false;
    };
  }, []);

  // Reader Login
  async function login(email, password) {
    const response = await fetch(
      `${API_URL}/api/reader/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (!data.token) {
      throw new Error("Login token missing from server response");
    }

    localStorage.setItem("readerToken", data.token);

    setUser(data.user || data.reader || null);

    return data;
  }

  // Reader Register
  async function register(name, email, password) {
    const response = await fetch(
      `${API_URL}/api/reader/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    if (!data.token) {
      throw new Error(
        "Registration token missing from server response"
      );
    }

    localStorage.setItem("readerToken", data.token);

    setUser(data.user || data.reader || null);

    return data;
  }

  // Reader Logout
  function logout() {
    localStorage.removeItem("readerToken");
    setUser(null);
  }

  return (
    <ReaderAuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {children}
    </ReaderAuthContext.Provider>
  );
}

export function useReaderAuth() {
  const context = useContext(ReaderAuthContext);

  if (!context) {
    throw new Error(
      "useReaderAuth must be used inside ReaderAuthProvider"
    );
  }

  return context;
}
