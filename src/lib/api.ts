import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Only redirect on 401 — do NOT clear token here (useAuthStore owns that)
api.interceptors.response.use(
  (res) => res,
  (err) => {
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