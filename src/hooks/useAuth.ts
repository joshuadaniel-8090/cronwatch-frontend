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

  // Treat "not authenticated yet" the same as "still loading". Every consumer
  // of this hook gates its skeleton/data-fetching on isLoading, so without
  // this an unauthenticated visitor's protected page shell (and its data
  // fetches) would briefly mount for one render before the redirect above
  // takes effect.
  const effectiveLoading = isLoading || !isInitialized || !isAuthenticated;

  return { isAuthenticated, isLoading: effectiveLoading, isInitialized };
};
