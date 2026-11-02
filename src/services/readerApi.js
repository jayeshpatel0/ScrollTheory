
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const token = localStorage.getItem("readerToken");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const readerApi = {
  getBookmarks() {
    return request("/api/bookmarks");
  },

  addBookmark(articleId) {
    return request(`/api/bookmarks/${articleId}`, {
      method: "POST",
    });
  },

  removeBookmark(articleId) {
    return request(`/api/bookmarks/${articleId}`, {
      method: "DELETE",
    });
  },
};
