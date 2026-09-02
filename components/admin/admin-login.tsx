"use client";

import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess();
      } else {
        setError(data.error || "Invalid admin credentials. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 bg-[#080402] text-stone-100 font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[250px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Luxury Compact Glassmorphic Login Card */}
      <div className="w-full max-w-[360px] bg-[#120904]/95 border border-orange-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl relative z-10 space-y-3.5 my-auto">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-md shadow-amber-500/25">
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Admin Authentication</span>
          </div>

          <h1 className="text-lg sm:text-xl font-black text-amber-200 font-serif tracking-tight">
            Management Portal
          </h1>

          <p className="text-[11px] text-stone-400">
            Sign in to manage registered shop & dishes.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-2 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-[11px] text-center font-medium animate-shake">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-2.5">
          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-amber-300 block">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. admin)"
                autoCapitalize="none"
                autoComplete="username"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-900/90 border border-orange-500/30 focus:border-amber-400 text-xs text-stone-100 placeholder:text-stone-600 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-amber-300 block">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-stone-900/90 border border-orange-500/30 focus:border-amber-400 text-xs text-stone-100 placeholder:text-stone-600 outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 disabled:opacity-50 mt-1"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In To Admin Portal</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
