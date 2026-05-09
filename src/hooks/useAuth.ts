// src/hooks/useAuth.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

export const useAuth = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we have definitely finished initializing and are not authenticated
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  return { isAuthenticated, isLoading, isInitialized };
};
