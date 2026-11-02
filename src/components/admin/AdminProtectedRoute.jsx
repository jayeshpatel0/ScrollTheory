
import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminProtectedRoute() {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <main className="admin-loading">
        <p>Verifying admin session...</p>
      </main>
    );
  }

  if (!admin || admin.role !== "admin") {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return <Outlet />;
}
