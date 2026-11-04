
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://scrolltheory.onrender.com"
).replace(/\/+$/, "");

export default API_URL;
