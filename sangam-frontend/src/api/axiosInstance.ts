import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

// Attach token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No token found in localStorage. API calls may fail.");
  }
  return config;
});

// Handle 401 errors (unauthorized) - redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 Unauthorized - Token expired or invalid");
      console.error("   Redirecting to login...");
      localStorage.removeItem("token");
      // Only redirect if we're not already on login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
