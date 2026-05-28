"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { apiClient } from "@/lib/api-client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

import {
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Timer,
} from "lucide-react";

// Spotlight Card
function SpotlightCard({ children, className = "" }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative border border-white/10 bg-[#0A0A0A] overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.1),
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative h-full z-10">{children}</div>
    </div>
  );
}

// Background
const GridBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />

    <div className="absolute top-0 left-0 w-full h-[60vh] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />

    <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
  </div>
);

const COOLDOWN_SECONDS = 60;

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cooldown, setCooldown] = useState(0);

  const router = useRouter();

  // Prefill email
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);

      const emailParam = params.get("email");

      if (emailParam) {
        setEmail(emailParam.trim().toLowerCase());
      }
    }
  }, []);

  // Cooldown sync
  useEffect(() => {
    if (!email) return;

    const updateTimer = () => {
      const stored = localStorage.getItem(`otpCooldown_${email}`);

      if (stored) {
        const expiry = parseInt(stored, 10);

        const remaining = Math.max(
          0,
          Math.ceil((expiry - Date.now()) / 1000)
        );

        setCooldown(remaining);

        if (remaining <= 0) {
          localStorage.removeItem(`otpCooldown_${email}`);
        }
      } else {
        setCooldown(0);
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    const handleStorageChange = (e) => {
      if (e.key === `otpCooldown_${email}`) {
        updateTimer();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [email]);

  // Start cooldown
  const startCooldown = useCallback(
    (seconds) => {
      if (!email) return;

      const remainingSeconds = seconds || COOLDOWN_SECONDS;

      setCooldown(remainingSeconds);

      const expiry = Date.now() + remainingSeconds * 1000;

      localStorage.setItem(
        `otpCooldown_${email.trim().toLowerCase()}`,
        expiry.toString()
      );
    },
    [email]
  );

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiClient.verifyOTP(
        email.trim().toLowerCase(),
        otp.trim()
      );

      if (response.status === 200) {
        // Auto login after verification

        const loginResponse = await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (loginResponse?.ok) {
          toast.success("Email verified successfully! Logging you in...");
          setSuccess("Verification successful! Redirecting...");

          if (email) {
            localStorage.removeItem(`otpCooldown_${email}`);
          }

          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          setSuccess(
            "Verification successful! Please login manually."
          );

          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      }
    } catch (err) {
      if (
        err?.response?.data?.errors &&
        err.response.data.errors.length > 0
      ) {
        setError(err.response.data.errors[0].messages[0]);
      } else if (err.response?.status === 400) {
        setError("Invalid OTP. Please try again.");
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your email address first.");
      return;
    }

    setResending(true);

    setError("");
    setSuccess("");

    try {
      const response = await apiClient.resendOTP(trimmedEmail);

      if (response?.data?.success) {
        setSuccess("A new OTP has been sent to your email!");

        startCooldown(
          response.data.cooldownSeconds || COOLDOWN_SECONDS
        );
      }
    } catch (err) {
      if (err?.response?.status === 429) {
        const remaining =
          err.response.data?.cooldownRemaining ||
          COOLDOWN_SECONDS;

        startCooldown(remaining);

        setError(
          `Please wait ${remaining}s before requesting a new OTP.`
        );
      } else if (
        err?.response?.data?.errors &&
        err.response.data.errors.length > 0
      ) {
        setError(err.response.data.errors[0].messages[0]);
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 flex items-center justify-center p-6">
      <GridBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <SpotlightCard className="rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Verify Account
            </h1>

            <p className="text-slate-400 text-sm">
              Enter the OTP sent to your email to verify your
              identity.
            </p>
          </div>

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />

              {success}
            </motion.div>
          )}

          {/* Error */}
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
          <form onSubmit={handleVerify} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-1 uppercase tracking-wider">
                Email Address
              </label>

              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />

                <input
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* OTP */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-1 uppercase tracking-wider">
                One-Time Password
              </label>

              <div className="relative group">
                <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />

                <input
                  type="text"
                  value={otp}
                  disabled={loading}
                  onChange={(e) => {
                    const val = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setOTP(val);
                  }}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 ml-1 uppercase tracking-wider">
                Password
              </label>

              <div className="relative group">
                <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />

                <input
                  type="password"
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !email ||
                !otp ||
                otp.length < 6 ||
                !password
              }
              className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg shadow-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />

                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Continue</span>

                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Didn&apos;t receive the code?
              </p>

              {cooldown > 0 ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Timer className="w-3.5 h-3.5 text-blue-400" />

                  <span>
                    Resend in{" "}
                    <span className="text-blue-400 font-mono font-medium">
                      {formatTime(cooldown)}
                    </span>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending || !email}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />

                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />

                      Resend OTP
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Check your spam folder if you don&apos;t see the
              email.
            </p>
          </div>
        </SpotlightCard>
      </motion.div>
    </div>
  );
}