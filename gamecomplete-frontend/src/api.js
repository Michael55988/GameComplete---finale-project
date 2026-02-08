import axios from "axios";

// Use production API URL if available, otherwise fallback to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gc_token") || sessionStorage.getItem("gc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
