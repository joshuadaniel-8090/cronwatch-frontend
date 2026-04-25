"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout, Mail, Lock, Loader2 } from "lucide-react";
import api from "../../src/lib/api";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { fetchUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", response.data.access_token);
      await fetchUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10 group">
          <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <Layout className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Cronwatch</span>
        </Link>

        <div className="bg-bg-surface border border-border-card rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-6">Welcome back</h1>
          
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
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <div className="text-brand-error text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-primary hover:text-[#A78BFA] font-medium transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
