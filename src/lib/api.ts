import axios from "axios";

const getBaseUrl = () => {
  // Falls back to localhost (obviously broken if actually hit in a deployed
  // build) rather than a specific developer's Render URL, so a missing
  // NEXT_PUBLIC_API_URL in a real deployment fails loudly instead of quietly
  // talking to someone else's backend.
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Update last activity on successful requests
    if (typeof window !== "undefined" && localStorage.getItem("access_token")) {
      localStorage.setItem("last_activity", Date.now().toString());
    }
    return res;
  },
  (err) => {
    if (process.env.NODE_ENV !== 'production') {
      const fullUrl = `${err.config?.baseURL}${err.config?.url}`;
      const status = err.response?.status;
      // "silent" requests (e.g. the backend-connectivity ping in AuthInit/
      // BackendStatus) deliberately hit an authenticated endpoint with no
      // token just to see if anything answers — a 401/403 there is expected
      // and already handled by the caller, not a real error worth logging.
      if (!err.config?.silent && (!status || status !== 401)) {
        console.error(`[API Error] ${err.config?.method?.toUpperCase()} ${fullUrl} - Status: ${status || "Network Error"}`);
      }
    }

    // Global 401 handling: an expired/revoked token used to just surface a
    // generic "failed to fetch" toast forever with no way out. Don't force
    // this on the login/register calls themselves — a wrong password there
    // is an expected 401, not a session expiry.
    const url: string = err.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
    if (err.response?.status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("last_activity");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
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
export const getUrlMonitorUptimeHistory = (id: string) => api.get(`/url-monitors/${id}/uptime-history`);

// Account
export const deleteAccount = () => api.delete("/auth/me");
