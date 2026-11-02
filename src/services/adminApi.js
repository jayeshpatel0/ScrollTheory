
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

export async function adminRequest(
  endpoint,
  options = {},
  token
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong."
    );
  }

  return data;
}

export async function adminLogin(email, password) {
  return adminRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getAdminProfile(token) {
  return adminRequest("/api/auth/me", {}, token);
}

export async function getAdminArticles(token) {
  return adminRequest(
    "/api/articles/admin/all",
    {},
    token
  );
}

export async function getPublishedArticles() {
  return adminRequest("/api/articles");
}
