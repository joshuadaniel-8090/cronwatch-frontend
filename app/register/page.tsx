"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layout, Mail, Lock, Loader2, User, ChevronDown } from "lucide-react";
import api from "../../src/lib/api";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usageCategory, setUsageCategory] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { fetchUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.post("/auth/register", { 
        name,
        email, 
        password,
        usage_category: usageCategory,
        referral_source: referralSource
      });
      const loginResponse = await api.post("/auth/login", { email, password });
      localStorage.setItem("access_token", loginResponse.data.access_token);
      await fetchUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
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
          <h1 className="text-2xl font-bold text-white mb-6">Create account</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Why are you using Cronwatch? (Optional)</label>
              <div className="relative">
                <select
                  value={usageCategory}
                  onChange={(e) => setUsageCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white appearance-none focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
                >
                  <option value="">Select an option</option>
                  <option value="personal">Personal</option>
                  <option value="company">Company</option>
                  <option value="solopreneur">Solopreneur</option>
                  <option value="small_business">Small Business</option>
                  <option value="others">Others</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">How did you hear about us? (Optional)</label>
              <div className="relative">
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-white appearance-none focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
                >
                  <option value="">Select an option</option>
                  <option value="x_twitter">X / Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="google">Google Search</option>
                  <option value="friends">Friends / Word of Mouth</option>
                  <option value="others">Others</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              </div>
            </div>

            {error && <div className="text-brand-error text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brand-primary hover:bg-[#6D31D1] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-primary hover:text-[#A78BFA] font-medium transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
