
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./ReaderManagement.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const PAGE_SIZE = 10;

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  return (name || "R")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function ReaderManagement() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const [readers, setReaders] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedReader, setSelectedReader] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Admin API helper
  const adminRequest = useCallback(
    async (endpoint, options = {}) => {
      const token = localStorage.getItem(
        "scrolltheory_admin_token"
      );

      if (!token) {
        logout();
        navigate("/admin/login", { replace: true });
        throw new Error("Admin session not found.");
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      // Admin authentication expired/invalid
      if (response.status === 401 || response.status === 403) {
        logout();
        navigate("/admin/login", { replace: true });
        throw new Error("Admin session expired. Please login again.");
      }

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Something went wrong."
        );
      }

      return result;
    },
    [logout, navigate]
  );

  // Load readers
  const loadReaders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (search) {
        params.set("search", search);
      }

      const result = await adminRequest(
        `/admin/readers?${params.toString()}`
      );

      // Supports both API response formats:
      // { success, readers, pagination }
      // { success, data: { readers, pagination } }
      const payload = result.data || result;

      setReaders(payload.readers || []);

      setPagination(
        payload.pagination || {
          page,
          limit: PAGE_SIZE,
          total: (payload.readers || []).length,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err.message || "Unable to load readers.");
    } finally {
      setLoading(false);
    }
  }, [page, search, adminRequest]);

  useEffect(() => {
    loadReaders();
  }, [loadReaders]);

  // Search
  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
    setNotice("");
    setActionError("");
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // View reader profile
  const handleViewProfile = async (reader) => {
    setSelectedReader(null);
    setProfileLoading(true);
    setActionError("");

    try {
      const result = await adminRequest(
        `/admin/readers/${reader.id}`
      );

      const payload = result.data || result;

      setSelectedReader(payload.reader || reader);
    } catch (err) {
      setActionError(err.message || "Unable to load profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Block / Unblock
  const handleStatusChange = async (reader) => {
    const isBlocked = reader.account_status === "blocked";

    const nextStatus = isBlocked ? "active" : "blocked";

    const actionText = isBlocked ? "unblock" : "block";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${reader.name}?`
    );

    if (!confirmed) return;

    setProcessingId(reader.id);
    setActionError("");
    setNotice("");

    try {
      await adminRequest(
        `/admin/readers/${reader.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            account_status: nextStatus,
          }),
        }
      );

      setReaders((prev) =>
        prev.map((item) =>
          item.id === reader.id
            ? { ...item, account_status: nextStatus }
            : item
        )
      );

      setSelectedReader((prev) =>
        prev && prev.id === reader.id
          ? { ...prev, account_status: nextStatus }
          : prev
      );

      setNotice(
        `${reader.name} has been ${
          nextStatus === "blocked" ? "blocked" : "activated"
        } successfully.`
      );
    } catch (err) {
      setActionError(err.message || "Unable to update reader.");
    } finally {
      setProcessingId(null);
    }
  };

  // Delete reader
  const handleDeleteReader = async (reader) => {
    const confirmed = window.confirm(
      `DELETE READER?\n\nName: ${reader.name}\nEmail: ${reader.email}\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setProcessingId(reader.id);
    setActionError("");
    setNotice("");

    try {
      await adminRequest(`/admin/readers/${reader.id}`, {
        method: "DELETE",
      });

      // Remove from UI
      setReaders((prev) =>
        prev.filter((item) => item.id !== reader.id)
      );

      setSelectedReader((prev) =>
        prev?.id === reader.id ? null : prev
      );

      setNotice(`${reader.name} has been deleted.`);

      // Refresh pagination / counts
      if (readers.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        await loadReaders();
      }
    } catch (err) {
      setActionError(
        err.message ||
          "Unable to delete reader. Check related database records."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const totalPages = pagination.totalPages || 0;

  return (
    <div className="st-readers-page">
      {/* Header */}
      <div className="st-readers-heading">
        <div>
          <span className="st-readers-eyebrow">
            SCROLLTHEORY / COMMUNITY
          </span>

          <h1>Readers</h1>

          <p>
            Manage, monitor and explore your registered reader
            community.
          </p>
        </div>

        <button
          type="button"
          className="st-readers-refresh"
          onClick={() => {
            setNotice("");
            setActionError("");
            loadReaders();
          }}
          disabled={loading}
        >
          ↻ {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Summary */}
      <div className="st-readers-summary">
        <div className="st-readers-stat">
          <div className="st-readers-stat-top">
            <span>Total Readers</span>
            <span className="st-readers-stat-icon">♙</span>
          </div>

          <h2>
            {Number(pagination.total || 0).toLocaleString("en-IN")}
          </h2>

          <p>Registered reader accounts</p>
        </div>
      </div>

      {/* Messages */}
      {notice && (
        <div className="st-readers-notice" role="status">
          <span>✓</span>
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

      {actionError && (
        <div className="st-readers-error" role="alert">
          <div>
            <strong>Action unsuccessful</strong>
            <p>{actionError}</p>
          </div>

          <button
            type="button"
            onClick={() => setActionError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* Directory */}
      <section className="st-readers-panel">
        <div className="st-readers-panel-heading">
          <div>
            <h2>Reader Directory</h2>
            <p>
              Search readers and manage their account status.
            </p>
          </div>

          <span className="st-readers-count">
            {Number(pagination.total || 0).toLocaleString("en-IN")}
            {" "}readers
          </span>
        </div>

        {/* Search */}
        <form
          className="st-readers-search"
          onSubmit={handleSearch}
        >
          <span className="st-readers-search-icon">⌕</span>

          <input
            type="search"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            aria-label="Search readers by name or email"
          />

          {searchInput && (
            <button
              type="button"
              className="st-readers-clear"
              onClick={clearSearch}
            >
              Clear
            </button>
          )}

          <button type="submit" className="st-readers-search-btn">
            Search
          </button>
        </form>

        {search && (
          <div className="st-readers-search-info">
            Results for <strong>"{search}"</strong>
            <button type="button" onClick={clearSearch}>
              Reset
            </button>
          </div>
        )}

        {error && (
          <div className="st-readers-error" role="alert">
            <div>
              <strong>Could not load readers</strong>
              <p>{error}</p>
            </div>

            <button type="button" onClick={loadReaders}>
              Try Again
            </button>
          </div>
        )}

        {/* Table */}
        <div className="st-readers-table-wrap">
          <table className="st-readers-table">
            <thead>
              <tr>
                <th>READER</th>
                <th>READER ID</th>
                <th>REGISTERED ON</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="st-readers-empty">
                    <div className="st-readers-loading">
                      <span className="st-readers-spinner" />
                      Loading readers...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="st-readers-empty">
                    Reader data unavailable.
                  </td>
                </tr>
              ) : readers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="st-readers-empty">
                    <div className="st-readers-empty-icon">♙</div>
                    <strong>No readers found</strong>
                    <p>
                      {search
                        ? "Try another search term."
                        : "Registered readers will appear here."}
                    </p>
                  </td>
                </tr>
              ) : (
                readers.map((reader) => {
                  const isBlocked =
                    reader.account_status === "blocked";

                  const isProcessing =
                    processingId === reader.id;

                  return (
                    <tr key={reader.id}>
                      {/* Reader */}
                      <td>
                        <div className="st-reader-identity">
                          <div className="st-reader-avatar">
                            {getInitials(reader.name)}
                          </div>

                          <div className="st-reader-info">
                            <strong>
                              {reader.name || "Unnamed Reader"}
                            </strong>
                            <span>{reader.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td>
                        <span className="st-reader-id">
                          #{reader.id}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <span className="st-reader-date">
                          {formatDate(reader.created_at)}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`st-reader-status ${
                            isBlocked ? "is-blocked" : "is-active"
                          }`}
                        >
                          <span className="st-reader-status-dot" />
                          {isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="st-reader-actions">
                          <button
                            type="button"
                            className="st-reader-action view"
                            onClick={() =>
                              handleViewProfile(reader)
                            }
                            disabled={isProcessing || profileLoading}
                            title="View profile"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className={`st-reader-action ${
                              isBlocked ? "unblock" : "block"
                            }`}
                            onClick={() =>
                              handleStatusChange(reader)
                            }
                            disabled={isProcessing}
                            title={
                              isBlocked
                                ? "Unblock reader"
                                : "Block reader"
                            }
                          >
                            {isProcessing
                              ? "Wait..."
                              : isBlocked
                                ? "Unblock"
                                : "Block"}
                          </button>

                          <button
                            type="button"
                            className="st-reader-action delete"
                            onClick={() =>
                              handleDeleteReader(reader)
                            }
                            disabled={isProcessing}
                            title="Delete reader"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && pagination.total > 0 && (
          <div className="st-readers-pagination">
            <p>
              Showing{" "}
              <strong>
                {(page - 1) * PAGE_SIZE + 1}
              </strong>
              {" – "}
              <strong>
                {Math.min(page * PAGE_SIZE, pagination.total)}
              </strong>
              {" of "}
              <strong>{pagination.total}</strong>
            </p>

            <div className="st-readers-page-controls">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((prev) => Math.max(1, prev - 1))
                }
              >
                ← Previous
              </button>

              <span>
                {page} / {Math.max(1, totalPages)}
              </span>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  loading ||
                  totalPages === 0
                }
                onClick={() =>
                  setPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Reader Profile Modal */}
      {(selectedReader || profileLoading) && (
        <div
          className="st-reader-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedReader(null);
            }
          }}
        >
          <section
            className="st-reader-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="st-reader-modal-title"
          >
            <div className="st-reader-modal-header">
              <div>
                <span className="st-readers-eyebrow">
                  COMMUNITY / PROFILE
                </span>
                <h2 id="st-reader-modal-title">
                  Reader Profile
                </h2>
              </div>

              <button
                type="button"
                className="st-reader-modal-close"
                onClick={() => setSelectedReader(null)}
                aria-label="Close profile"
              >
                ×
              </button>
            </div>

            {profileLoading ? (
              <div className="st-reader-profile-loading">
                <span className="st-readers-spinner" />
                Loading profile...
              </div>
            ) : selectedReader ? (
              <>
                <div className="st-reader-profile-hero">
                  <div className="st-reader-profile-avatar">
                    {getInitials(selectedReader.name)}
                  </div>

                  <div>
                    <h3>
                      {selectedReader.name || "Unnamed Reader"}
                    </h3>
                    <p>{selectedReader.email}</p>
                  </div>
                </div>

                <div className="st-reader-profile-details">
                  <div className="st-reader-profile-field">
                    <span>Reader ID</span>
                    <strong>#{selectedReader.id}</strong>
                  </div>

                  <div className="st-reader-profile-field">
                    <span>Account Status</span>
                    <strong>
                      <span
                        className={`st-reader-status ${
                          selectedReader.account_status === "blocked"
                            ? "is-blocked"
                            : "is-active"
                        }`}
                      >
                        <span className="st-reader-status-dot" />
                        {selectedReader.account_status === "blocked"
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </strong>
                  </div>

                  <div className="st-reader-profile-field">
                    <span>Registered On</span>
                    <strong>
                      {formatDate(selectedReader.created_at)}
                    </strong>
                  </div>

                  <div className="st-reader-profile-field">
                    <span>Email Address</span>
                    <strong className="st-reader-profile-email">
                      {selectedReader.email}
                    </strong>
                  </div>
                </div>

                <div className="st-reader-modal-footer">
                  <button
                    type="button"
                    className={`st-reader-action ${
                      selectedReader.account_status === "blocked"
                        ? "unblock"
                        : "block"
                    }`}
                    disabled={processingId === selectedReader.id}
                    onClick={() =>
                      handleStatusChange(selectedReader)
                    }
                  >
                    {processingId === selectedReader.id
                      ? "Please wait..."
                      : selectedReader.account_status === "blocked"
                        ? "Unblock Reader"
                        : "Block Reader"}
                  </button>

                  <button
                    type="button"
                    className="st-reader-action delete"
                    disabled={processingId === selectedReader.id}
                    onClick={() =>
                      handleDeleteReader(selectedReader)
                    }
                  >
                    Delete Reader
                  </button>
                </div>
              </>
            ) : null}
          </section>
        </div>
      )}

      <footer className="st-readers-footer">
        ScrollTheory CMS · Reader Management
      </footer>
    </div>
  );
}

export default ReaderManagement;
