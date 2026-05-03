import axios from "axios";

const getBaseUrl = () => {
  // If we're on the client, use relative /api path to benefit from Next.js rewrites (CORS fix)
  if (typeof window !== "undefined") {
    return "/api";
  }
  // Server-side: use the direct URL if available, else localhost (unlikely to be used in this SPA pattern)
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
      const pathname = window.location.pathname;
      const publicPaths = ["/", "/login", "/register"];
      if (!publicPaths.includes(pathname)) {
        // Small delay so a server cold-boot doesn't instantly redirect
        setTimeout(() => {
          if (!localStorage.getItem("access_token")) {
            window.location.href = "/login";
          }
        }, 500);
      }
    }
    return Promise.reject(err);
  }
);

export default api;