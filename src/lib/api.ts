import axios from "axios";

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "https://cronwatch-backend.onrender.com";
};

const api = axios.create({
  baseURL: getBaseUrl().replace(/\/$/, "") + "/",
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const fullUrl = `${config.baseURL}${config.url}`;
  console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
  return config;
});

// Only redirect on 401 — do NOT clear token here (useAuthStore owns that)
api.interceptors.response.use(
  (res) => {
    // Update last activity on successful requests
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      localStorage.setItem("last_activity", Date.now().toString());
    }
    return res;
  },
  (err) => {
    const fullUrl = `${err.config?.baseURL}${err.config?.url}`;
    console.error(`[API Error] ${err.config?.method?.toUpperCase()} ${fullUrl} - Status: ${err.response?.status || "Network Error"}`);
    
    if (err.response?.status === 401) {
      // Use the store's logout which handles the redirect and state cleanup
      const { useAuthStore } = require("../store/useAuthStore");
      useAuthStore.getState().logout();
    }
    
    return Promise.reject(err);
  }
);

export default api;

// URL Monitors
export const getUrlMonitors = () => api.get("/url-monitors");
export const createUrlMonitor = (data: any) => api.post("/url-monitors", data);
export const getUrlMonitor = (id: string) => api.get(`/url-monitors/${id}`);
export const updateUrlMonitor = (id: string, data: any) => api.put(`/url-monitors/${id}`, data);
export const deleteUrlMonitor = (id: string) => api.delete(`/url-monitors/${id}`);
export const getUrlMonitorLogs = (id: string, page = 1) =>
  api.get(`/url-monitors/${id}/logs?page=${page}&limit=50`);
export const getUrlMonitorAlerts = (id: string) => api.get(`/url-monitors/${id}/alerts`);
export const testUrlMonitor = (url: string) => api.post("/url-monitors/test", { url });
