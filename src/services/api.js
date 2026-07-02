import axios from "axios";

// Environment settings checking with localStorage overrides
export const API_BASE_URL =
  localStorage.getItem("WW_API_URL") ||
  import.meta.env.VITE_API_URL ||
  "https://wealth-wisdom-six.vercel.app/api/v1";

export const ADMIN_API_KEY =
  localStorage.getItem("WW_ADMIN_API_KEY") ||
  import.meta.env.VITE_ADMIN_API_KEY ||
  "";

export const API_KEY =
  localStorage.getItem("WW_API_KEY") ||
  import.meta.env.VITE_API_KEY ||
  "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Outgoing request interceptor
api.interceptors.request.use((config) => {
  // Use admin key for all rates routes and admin routes
  const isRatesRoute = config.url?.includes("/rates");
  const isAdminRoute = config.url?.includes("/admin") || config.url?.includes("/health/detailed");
  const key = (isRatesRoute || isAdminRoute) ? ADMIN_API_KEY : API_KEY || ADMIN_API_KEY;
  
  if (key && !config.headers["X-API-Key"]) {
    config.headers["X-API-Key"] = key;
  }

  console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
    url: config.url,
    headers: config.headers,
  });

  return config;
});

// Incoming response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] ${response.status} from ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const backendError =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail;
    
    const message =
      backendError ||
      (status ? `Request failed with status ${status}` : error.message || "Network Error");

    console.error(`[API ERROR] Status: ${status || "No Status"}`, {
      message,
      responseData: error.response?.data,
      url: error.config?.url,
    });

    const formattedError = new Error(message);
    formattedError.status = status;
    formattedError.backendError = backendError;
    return Promise.reject(formattedError);
  }
);

export default api;
