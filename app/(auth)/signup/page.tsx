"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";

export default function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });

  const router = useRouter();
  const { user, login, loginWithGoogle } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.mobile || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            phone_number: formData.mobile,
            full_name: formData.email.split('@')[0], // You can add a name field later
            signup_date: new Date().toISOString(),
            user_type: 'standard' // You can add more fields as needed
          }
        }
      });

      if (signUpError) {
        console.warn("Supabase signup error:", signUpError.message);
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      // Handle successful signup
      console.log("Signup successful:", data);
      console.log("User metadata:", data.user?.user_metadata);
      console.log("Phone number being stored:", formData.mobile);

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required - redirect to confirmation page
        router.push('/email-confirmation');
        return;
      }

      if (data.session) {
        // ✅ Sync user & set HttpOnly cookie via Nest backend
        try {
          await api.auth.login(data.session.access_token);
        } catch (syncErr: any) {
          console.warn("Signup backend session setup failed (backend may be offline):", syncErr.message || syncErr);
        }
      }

      // Update user context (localStorage will be handled by UserContext)
      login(data.user);

    } catch (err: any) {
      if (err.message?.includes('User already registered')) {
        setError("Email already exists. Please use a different email.");
      } else if (err.message?.includes('Password should be at least')) {
        setError("Password must be at least 6 characters long");
      } else if (err.message?.includes('Invalid email')) {
        setError("Please enter a valid email address");
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await loginWithGoogle();
      if (error) {
        setError("Google login failed. Please try again.");
        console.error("Google login error:", error);
        return;
      }

      // Redirect happens automatically, so no further code execution here is needed.
      // Context will handle the session and sync after redirect.
    } catch (err) {
      setError("Google login failed. Please try again.");
      console.error("Google login error:", err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 bg-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-lime-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-gradient-lime text-xs font-bold tracking-[0.2em] uppercase mb-2">Aurora FX</span>
          <h2 className="text-3xl font-bold text-center tracking-tight">Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error/Success Message */}
          {error && (
            <div className={`px-4 py-3 rounded-lg text-sm ${error.includes('✅')
              ? 'bg-green-500/20 border border-green-500/50 text-green-200'
              : 'bg-red-500/20 border border-red-500/50 text-red-200'
              }`}>
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-white/80 font-medium">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm mb-1 text-white/80 font-medium">Mobile Number *</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-colors"
              placeholder="Enter mobile number"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-white/80 font-medium">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-colors placeholder:text-muted-foreground"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm mb-1 text-white/80 font-medium">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-colors placeholder:text-muted-foreground"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-lime-400 text-black font-semibold shadow-lg hover:bg-lime-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/20"></div>
          <span className="px-4 text-sm text-gray-300">or</span>
          <div className="flex-1 border-t border-white/20"></div>
        </div>

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 rounded-full bg-white text-black font-semibold shadow-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {isLoading ? "Signing up..." : "Continue with Google"}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-lime-400 hover:text-lime-300 hover:underline font-medium transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
