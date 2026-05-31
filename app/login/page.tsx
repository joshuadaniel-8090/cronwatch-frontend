"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import api from "../../src/lib/api";
import { getErrorMessage } from "../../src/lib/utils";
import { useAuthStore } from "../../src/store/useAuthStore";
import { BackendStatus } from "../../src/components/auth/BackendStatus";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { fetchUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("auth/login", { email, password });
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("last_activity", Date.now().toString());
      await fetchUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4 sm:p-6">
      <BackendStatus />
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6 sm:mb-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-brand-muted hover:text-text-primary transition-colors text-sm font-medium border border-border-card px-4 py-2 rounded-full bg-bg-surface hover:bg-bg-subtle"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="bg-bg-surface border border-border-card rounded-2xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Welcome back</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-bg-base border border-border-card rounded-lg text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <div className="text-brand-error text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 text-sm"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-primary hover:text-brand-primary/80 font-medium transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
