import axios from "axios";

export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || "https://sevaconnect-backend-api.onrender.com"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to construct absolute URL for static files (documents/uploads)
export const getFileUrl = (filePath) => {
  if (!filePath) return "#";
  const cleanPath = String(filePath).replace(/\\/g, "/");
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }
  const relativePath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${API_BASE_URL}${relativePath}`;
};

export default api;
