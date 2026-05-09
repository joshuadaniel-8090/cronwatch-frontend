// src/store/useAuthStore.ts
import { create } from "zustand";
import { User } from "../types";
import api from "../lib/api";

const SESSION_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
  updateActivity: () => void;
}

// Helper to check if session is still valid
const isSessionValid = () => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("access_token");
  const lastActivity = localStorage.getItem("last_activity");
  
  if (!token || !lastActivity) return false;
  
  const now = Date.now();
  const lastActiveTime = parseInt(lastActivity, 10);
  
  return now - lastActiveTime < SESSION_DURATION;
};

// Initial state from localStorage to prevent flash of unauthenticated state
const getInitialAuthState = () => {
  if (typeof window === "undefined") return { isAuthenticated: false, user: null };
  const token = localStorage.getItem("access_token");
  const valid = !!token && isSessionValid();
  return { isAuthenticated: valid, user: null };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...getInitialAuthState(),
  isLoading: false,
  isInitialized: false,
  
  setUser: (user) => {
    if (user) {
      localStorage.setItem("last_activity", Date.now().toString());
    }
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  updateActivity: () => {
    if (localStorage.getItem("access_token")) {
      localStorage.setItem("last_activity", Date.now().toString());
    }
  },

  fetchUser: async () => {
    // Only run if we have window access
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");
    
    // Check if session has expired due to inactivity
    if (!token || !isSessionValid()) {
      if (token) {
        console.log("Session expired due to inactivity");
        await get().logout();
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      }
      return;
    }

    // We have a token and it's potentially valid, start loading if not already
    if (!get().user) {
      set({ isLoading: true });
    }

    try {
      // Update activity timestamp on every successful fetch
      localStorage.setItem("last_activity", Date.now().toString());
      
      const response = await api.get("auth/me");
      set({ user: response.data, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (error: any) {
      console.error("Auth verification failed:", error);
      
      // Only log out if the server explicitly rejects the token (401 specifically)
      if (error.response?.status === 401) {
        await get().logout();
      } else {
        // For network errors or 403, we keep the session active if we have a token
        // but stop loading and mark as initialized
        set({ isLoading: false, isInitialized: true });
      }
    }
  },

  logout: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("last_activity");
      
      // Mark as initialized so the spinner goes away during redirect
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });

      // Add a short delay before redirect so state can settle
      setTimeout(() => {
        const publicPaths = ["/", "/login", "/register"];
        if (!publicPaths.includes(window.location.pathname)) {
          window.location.href = "/login";
        }
      }, 200);
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },
}));
