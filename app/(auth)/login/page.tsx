"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext"; // Assuming aliases are setup
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { user, login, loginWithGoogle } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(""); // clear error on typing
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      console.log("Attempting login with:", formData.email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.warn("Supabase login error:", error.message);
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      const token = data.session?.access_token;
      const user = data.user;

      if (token && user) {
        // ✅ Normalize for your backend + frontend
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Sync user & set HttpOnly cookie via Nest backend
        try {
          await api.auth.login(token);
        } catch (syncErr: any) {
          console.warn("Backend auth session setup failed (backend may be offline):", syncErr.message || syncErr);
        }
      }

      login(user); // update UserContext
    } catch (err: any) {
      if (err.message?.includes("Invalid login credentials")) {
        setErrorMsg("Invalid email or password");
      } else if (err.message?.includes("Email not confirmed")) {
        setErrorMsg("Please confirm your email before logging in");
      } else if (err.message?.includes("Too many requests")) {
        setErrorMsg("Too many login attempts. Try again later.");
      } else {
        setErrorMsg(err.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await loginWithGoogle();
      if (error) {
        setErrorMsg("Google login failed. Please try again.");
        console.error("Google login error:", error);
        return;
      }

      const token = data?.session?.access_token;
      const user = data?.user;

      if (token && user) {
        // ✅ Normalize for your backend + frontend
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("user", JSON.stringify(user));

        // ✅ Sync user with Nest backend
        // ✅ Sync user & set HttpOnly cookie via Nest backend
        try {
          await api.auth.login(token);
        } catch (syncErr: any) {
          console.warn("Google backend session setup failed (backend may be offline):", syncErr.message || syncErr);
        }
      }

      // We rely on UserContext to push to dashboard after OAuth
      // login(user);
      // router.push("/dashboard");
    } catch (err) {
      setErrorMsg("Google login failed. Please try again.");
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
          <h2 className="text-3xl font-bold text-center tracking-tight">Welcome Back</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 text-white/80 font-medium">Email</label>
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

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-white/80 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:ring-2 focus:ring-lime-400 focus:outline-none transition-colors placeholder:text-muted-foreground"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-sm text-lime-400 hover:text-lime-300 transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
             <Link href="/forgot-password" className="text-sm text-lime-400 hover:text-lime-300 hover:underline font-medium transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-lime-400 text-black font-semibold shadow-lg hover:bg-lime-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/20"></div>
          <span className="px-4 text-sm text-gray-300">or</span>
          <div className="flex-1 border-t border-white/20"></div>
        </div>

        {/* Google Login */}
        <button
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
          {isLoading ? "Signing in..." : "Continue with Google"}
        </button>

        {/* Demo Login */}
        <button
          type="button"
          onClick={async () => {
            setIsLoading(true);
            try {
              const demoUser = {
                id: "demo-user",
                email: "demo@aurorafx.in",
                user_metadata: { full_name: "Demo User" },
              };

              localStorage.setItem("authToken", "demo-token");
              localStorage.setItem("userId", demoUser.id);
              localStorage.setItem("user", JSON.stringify(demoUser));

              // ✅ Login via Nest backend
              try {
                await api.auth.login("demo-token");
              } catch (syncErr: any) {
                console.warn("Demo backend setup failed (backend may be offline):", syncErr.message || syncErr);
              }

              // We cast it since demoUser is missing some Supabase fields but sufficient for UI
              login(demoUser as any);
              router.push("/dashboard");
            } catch (err) {
              console.error("Demo login failed:", err);
              setErrorMsg("Demo login failed");
            } finally {
              setIsLoading(false);
            }
          }}
          className="w-full mt-4 py-3 rounded-full bg-emerald-900/40 text-lime-400 font-semibold shadow-[0_0_15px_rgba(163,230,53,0.15)] hover:shadow-[0_0_25px_rgba(163,230,53,0.3)] hover:bg-emerald-900/60 border border-lime-400/30 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <svg className="w-5 h-5 animate-pulse text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Demo Login
        </button>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-lime-400 hover:text-lime-300 hover:underline font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
