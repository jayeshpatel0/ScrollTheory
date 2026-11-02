
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useReaderAuth } from "../../context/ReaderAuthContext";

export default function ReaderProtectedRoute() {
  const { user, loading } = useReaderAuth();
  const location = useLocation();

  if (loading) {
    return <main style={{ padding: 40 }}>Checking reader session...</main>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
