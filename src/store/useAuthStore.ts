// src/store/useAuthStore.ts
import { create } from "zustand";
import { User } from "../types";
import api from "../lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  fetchUser: async () => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await api.get("/auth/me");
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem("access_token");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: () => {
    localStorage.removeItem("access_token");
    set({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/login";
  },
}));
