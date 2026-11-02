
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReaderAuth } from "../../context/ReaderAuthContext";
import {
    UserRound,
    Mail,
    CalendarDays,
    Bookmark,
    Pencil,
    X,
    Check,
    LogOut,
    ArrowLeft,
} from "lucide-react";
import "./Profile.css";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

function Profile() {
    const { user, loading, logout, refreshMe } = useReaderAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name || "");
        }
    }, [user]);

    const getToken = () => localStorage.getItem("readerToken");

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Please enter your name.");
            return;
        }

        if (trimmedName.length > 100) {
            setError("Name cannot exceed 100 characters.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_URL}/api/reader/auth/me`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({ name: trimmedName }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update profile."
                );
            }

            // Update the current session's user object.
            // The profile UI uses the saved name locally.
            const updatedUser = await refreshMe();

            setName(updatedUser?.name || data.user.name);
            setMessage("Profile updated successfully!");
            setEditing(false);

            // Refresh user data through the existing auth flow.
            window.dispatchEvent(
                new CustomEvent("reader-profile-updated", {
                    detail: data.user,
                })
            );
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/", { replace: true });
    };

    if (loading) {
        return (
            <div className="profile-loading">
                Loading your profile...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-loading">
                Please <Link to="/login">login</Link> to continue.
            </div>
        );
    }

    const initials = (name || user.name || "Reader")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    const formattedDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        )
        : "Not available";

    return (
        <main className="reader-profile-page">
            <div className="reader-profile-container">

                <Link to="/" className="profile-back-link">
                    <ArrowLeft size={17} />
                    Back to Home
                </Link>

                <div className="profile-heading">
                    <span className="profile-eyebrow">
                        YOUR ACCOUNT
                    </span>
                    <h1>My Profile</h1>
                    <p>
                        Manage your account and your reading journey.
                    </p>
                </div>

                <section className="profile-card">

                    <div className="profile-cover"></div>

                    <div className="profile-main">

                        <div className="profile-avatar">
                            {initials || <UserRound size={38} />}
                        </div>

                        <div className="profile-identity">
                            <h2>{name || user.name}</h2>
                            <p>ScrollTheory Reader</p>
                        </div>

                        {!editing && (
                            <button
                                className="profile-edit-btn"
                                onClick={() => {
                                    setName(user.name || "");
                                    setEditing(true);
                                    setMessage("");
                                    setError("");
                                }}
                            >
                                <Pencil size={16} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="profile-divider"></div>

                    {message && (
                        <div className="profile-success">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="profile-error">
                            {error}
                        </div>
                    )}

                    {editing ? (
                        <form
                            className="profile-edit-form"
                            onSubmit={handleSave}
                        >
                            <label htmlFor="profileName">
                                Display Name
                            </label>

                            <input
                                id="profileName"
                                type="text"
                                maxLength={100}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />

                            <div className="profile-form-actions">
                                <button
                                    type="submit"
                                    className="profile-save-btn"
                                    disabled={saving}
                                >
                                    <Check size={16} />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>

                                <button
                                    type="button"
                                    className="profile-cancel-btn"
                                    disabled={saving}
                                    onClick={() => {
                                        setName(user.name || "");
                                        setEditing(false);
                                        setError("");
                                    }}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-details">

                            <div className="profile-detail-item">
                                <div className="profile-detail-icon">
                                    <UserRound size={20} />
                                </div>
                                <div>
                                    <span>Full Name</span>
                                    <strong>{name || user.name}</strong>
                                </div>
                            </div>

                            <div className="profile-detail-item">
                                <div className="profile-detail-icon">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <span>Email Address</span>
                                    <strong>{user.email}</strong>
                                </div>
                            </div>

                            <div className="profile-detail-item">
                                <div className="profile-detail-icon">
                                    <CalendarDays size={20} />
                                </div>
                                <div>
                                    <span>Member Since</span>
                                    <strong>{formattedDate}</strong>
                                </div>
                            </div>

                        </div>
                    )}
                </section>

                <section className="profile-quick-actions">
                    <Link
                        to="/saved-articles"
                        className="profile-action-card"
                    >
                        <div className="profile-action-icon">
                            <Bookmark size={23} />
                        </div>
                        <div>
                            <h3>Saved Articles</h3>
                            <p>Continue reading your bookmarked stories.</p>
                        </div>
                        <span className="profile-action-arrow">→</span>
                    </Link>

                    <button
                        type="button"
                        className="profile-action-card profile-logout-card"
                        onClick={handleLogout}
                    >
                        <div className="profile-action-icon">
                            <LogOut size={23} />
                        </div>
                        <div>
                            <h3>Logout</h3>
                            <p>Sign out of your reader account.</p>
                        </div>
                        <span className="profile-action-arrow">→</span>
                    </button>
                </section>

                <p className="profile-footer-note">
                    Your reading journey, all in one place.
                </p>

            </div>
        </main>
    );
}

export default Profile;
