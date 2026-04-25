"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/supabase";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (data.session) {
          localStorage.setItem("access_token", data.session.access_token);
          await fetchUser();
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        router.push("/login?error=auth_callback_failed");
      }
    };

    handleAuthCallback();
  }, [router, fetchUser]);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-white">
      <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
      <h1 className="text-xl font-bold">Completing sign in...</h1>
      <p className="text-brand-muted mt-2">Please wait while we set up your session.</p>
    </div>
  );
}
