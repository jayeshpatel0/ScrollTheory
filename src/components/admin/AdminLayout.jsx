
import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminLayout.css";

const links = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: "▦" },
      { label: "All Articles", path: "/admin/articles", icon: "▤" },
      { label: "New Article", path: "/admin/articles/new", icon: "+" },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { label: "Readers", path: "/admin/readers", icon: "♙" },
      { label: "Magazines", path: "/admin/magazines", icon: "▣" },
      { label: "Books", path: "/admin/books", icon: "▥" },
    ],
  },
  {
    title: "INSIGHTS & SYSTEM",
    items: [
      { label: "Analytics", path: "/admin/analytics", icon: "◷", comingSoon: true },
      { label: "Settings", path: "/admin/settings", icon: "⚙", comingSoon: true },
    ],
  },
];

function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    setSidebarOpen(false);
    logout();
    navigate("/admin/login", { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes("/articles/new")) return "Create Article";
    if (path.includes("/edit")) return "Edit Article";
    if (path.includes("/articles")) return "Article Management";
    if (path.includes("/dashboard")) return "Dashboard";

    return "Admin Workspace";
  };

  return (
    <div className="st-admin-layout">
      {sidebarOpen && (
        <button
          className="st-admin-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`st-admin-sidebar ${
          sidebarOpen ? "st-admin-sidebar-open" : ""
        }`}
      >
        <div className="st-admin-brand">
          <div className="st-admin-brand-icon">S</div>
          <div>
            <h2>ScrollTheory</h2>
            <span>ADMIN STUDIO</span>
          </div>

          <button
            className="st-admin-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        <div className="st-admin-profile">
          <div className="st-admin-avatar">
            {(admin?.name || "A").charAt(0).toUpperCase()}
          </div>

          <div className="st-admin-profile-info">
            <strong>{admin?.name || "Administrator"}</strong>
            <span>
              <span className="st-admin-online-dot" />
              Administrator
            </span>
          </div>
        </div>

        <nav className="st-admin-navigation">
          {links.map((group) => (
            <div className="st-admin-nav-group" key={group.title}>
              <p className="st-admin-nav-heading">{group.title}</p>

              {group.items.map((item) => {
                if (item.comingSoon) {
                  return (
                    <div
                      key={item.path}
                      className="st-admin-nav-link st-admin-nav-disabled"
                      title="Coming soon"
                      aria-disabled="true"
                    >
                      <span className="st-admin-nav-icon">{item.icon}</span>
                      <span className="st-admin-nav-text">{item.label}</span>
                      <span className="st-admin-soon">SOON</span>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `st-admin-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="st-admin-nav-icon">{item.icon}</span>
                    <span className="st-admin-nav-text">{item.label}</span>
                    {item.label === "New Article" && (
                      <span className="st-admin-nav-plus">↗</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="st-admin-sidebar-bottom">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="st-admin-website-link"
          >
            <span>↗</span>
            View Website
          </a>

          <button
            className="st-admin-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

          <div className="st-admin-sidebar-footer">
            ScrollTheory CMS · Admin
          </div>
        </div>
      </aside>

      <div className="st-admin-main">
        <header className="st-admin-topbar">
          <div className="st-admin-topbar-left">
            <button
              className="st-admin-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              ☰
            </button>

            <div>
              <span className="st-admin-topbar-label">
                SCROLLTHEORY / CONTENT STUDIO
              </span>
              <p>{getPageTitle()}</p>
            </div>
          </div>

          <div className="st-admin-topbar-user">
            <span className="st-admin-online-dot" />
            <span>Admin Workspace</span>
          </div>
        </header>

        <main className="st-admin-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
