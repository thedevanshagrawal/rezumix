"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import { EMAIL_REGEX } from "@/lib/validation";
import { apiClient } from "@/lib/api-client";
import SpotlightCard from "@/components/ui/SpotlightCard";
import GridBackground from "@/components/ui/GridBackground";
import GoogleSignInButton, {
  googleAuthErrorMessage,
} from "@/components/auth/GoogleSignInButton";

// --- Main Page ---

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  // Surface Google OAuth failures: NextAuth redirects back to
  // /login?error=<code> when a provider sign-in is cancelled or fails.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error");

    if (errorCode) {
      const message = googleAuthErrorMessage(errorCode);
      setError(message);
      toast.error(message);

      // Clean the query string so the error doesn't persist on reload.
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const isEmailValid = useMemo(() => {
    return EMAIL_REGEX.test(email);
  }, [email]);

  const handleEmailBlur = useCallback(() => {
    setEmailTouched(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailTouched(true);

    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    const result = await signIn("credentials", {
      email: trimmedEmail,
      password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error.includes("verified")) {
        try {
          const response = await apiClient.resendOTP(trimmedEmail);

          if (response?.data?.success) {
            const expiry =
              Date.now() +
              (response.data.cooldownSeconds || 60) * 1000;

            localStorage.setItem(
              `otpCooldown_${trimmedEmail}`,
              expiry.toString()
            );

            toast.info("Account not verified. A new OTP has been sent. Redirecting...");
            setError(
              "Account not verified. A new OTP has been sent. Redirecting to verification..."
            );

            setTimeout(() => {
              router.push(
                `/verify-otp?email=${encodeURIComponent(trimmedEmail)}`
              );
            }, 2500);
          }
        } catch (err) {
          if (err?.response?.status === 429) {
            const remaining =
              err.response.data?.cooldownRemaining || 60;

            const expiry = Date.now() + remaining * 1000;

            localStorage.setItem(
              `otpCooldown_${trimmedEmail}`,
              expiry.toString()
            );

            toast.warning(`OTP already sent. Try again in ${remaining}s. Redirecting...`);
            setError(
              `Account not verified. An OTP was already sent recently (${remaining}s remaining). Redirecting...`
            );

            setTimeout(() => {
              router.push(
                `/verify-otp?email=${encodeURIComponent(trimmedEmail)}`
              );
            }, 2500);
          } else {
            toast.error("Failed to send OTP. Please try again.");
            setError(
              "Account not verified. Failed to send OTP. Please try again."
            );

            setLoading(false);
          }
        }

        return;
      }

      toast.error("Invalid credentials. Please check your email and password.");
      setError("Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Login successful! Redirecting to dashboard...");
    // FIXED REDIRECT
    router.push("/dashboard");

    setLoading(false);
  };

  if (session) return null;

  return (
    <div className="relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 flex items-center justify-center p-6">
      <GridBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <SpotlightCard className="rounded-3xl p-8 md:p-10 shadow-2xl bg-[#0A0A0A] border border-white/10">
          {/* Header */}

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome Back
            </h1>

            <p className="text-slate-400 text-sm">
              Enter your credentials to access your <br />

              <span className="text-blue-400 font-medium">
                Rezumix Intelligence Dashboard
              </span>
            </p>
          </div>

          {/* Error Message */}

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />

              {error}
            </motion.div>
          )}

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            {/* Email */}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-1 uppercase tracking-wider">
                Email
              </label>

              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={`w-full bg-[#050505] border rounded-xl py-3 pl-12 pr-10 text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all ${
                    emailTouched && !isEmailValid
                      ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
                      : emailTouched && isEmailValid
                      ? "border-green-500/30 focus:border-green-500/50 focus:ring-green-500/50"
                      : "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/50"
                  }`}
                />
              </div>
            </div>

            {/* Password */}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-1 uppercase tracking-wider">
                Password
              </label>

              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-blue-400 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Button */}

            <button
              type="submit"
              disabled={
                loading ||
                !email ||
                !password ||
                (emailTouched && !isEmailValid)
              }
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg shadow-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}

          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              Or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Continue with Google */}

          <GoogleSignInButton
            callbackUrl="/dashboard"
            onError={setError}
          />

          {/* Footer */}

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-slate-400 text-sm">
              Don&apos;t have an account?{" "}

              <Link
                href="/register"
                className="text-white font-medium hover:text-blue-400 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
}