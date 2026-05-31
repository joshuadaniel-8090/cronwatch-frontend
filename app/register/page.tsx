"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ChevronDown, Eye, EyeOff, ArrowLeft } from "lucide-react";
import api from "../../src/lib/api";
import { getErrorMessage } from "../../src/lib/utils";
import { useAuthStore } from "../../src/store/useAuthStore";
import { BackendStatus } from "../../src/components/auth/BackendStatus";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      await api.post("auth/register", { 
        name,
        email, 
        password,
        usage_category: usageCategory,
        referral_source: referralSource
      });
      const loginResponse = await api.post("auth/login", { email, password });
      localStorage.setItem("access_token", loginResponse.data.access_token);
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
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Create account</h1>
          
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
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-text-primary focus:outline-none focus:border-brand-primary transition-colors"
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

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Why are you using Cronwatch? (Optional)</label>
              <div className="relative">
                <select
                  value={usageCategory}
                  onChange={(e) => setUsageCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-text-primary appearance-none focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
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
                  className="w-full px-4 py-2.5 bg-bg-base border border-border-card rounded-lg text-text-primary appearance-none focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
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
              className="w-full h-11 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 text-sm"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-primary hover:text-brand-primary/80 font-medium transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
