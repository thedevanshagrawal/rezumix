"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { EMAIL_REGEX } from "@/lib/validation";
import { apiClient } from "@/lib/api-client";
import { useThemeMode } from "@/hooks/use-theme-mode";

// --- Components ---

// 1. Spotlight Card (Visual Wrapper)
function SpotlightCard({ children, className = "", isLight = false }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`relative overflow-hidden group ${isLight ? "border border-slate-200 bg-white/85" : "border border-white/10 bg-neutral-900/50"} ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
               650px circle at ${mouseX}px ${mouseY}px,
               ${isLight ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.1)"},
               transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full z-10">{children}</div>
        </div>
    );
}

// 2. Background Pattern
const GridBackground = ({ isLight = false }) => (
    <div className={`fixed inset-0 z-0 pointer-events-none ${isLight ? "bg-[#f8fafc]" : "bg-[#050505]"}`}>
        <div className={`absolute inset-0 bg-[size:32px_32px] ${isLight ? "bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)]" : "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"}`} />
        <div className={`absolute top-0 left-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-blue-500/10 mix-blend-multiply" : "bg-blue-600/5 mix-blend-screen"}`} />
        <div className={`absolute bottom-0 right-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-violet-500/10 mix-blend-multiply" : "bg-purple-600/5 mix-blend-screen"}`} />
    </div>
);

// --- Main Page Component ---

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const { isLight } = useThemeMode();

    const { data: session } = useSession();
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (session?.user) {
            const roleRedirects = {
                "admin": "/admindashboard",
                "user": "/dashboard",
            };
            router.push(roleRedirects[session.user.role] || "/");
        }
    }, [session, router]);

    // Email validation state
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

        const result = await signIn("credentials", {
            email: email.trim().toLowerCase(),
            password,
            redirect: false,
        });

        if (result?.error) {
            if (result.error.includes("verified")) {
                const trimmedEmail = email.trim().toLowerCase();
                try {
                    const response = await apiClient.resendOTP(trimmedEmail);
                    if (response?.data?.success) {
                        const expiry = Date.now() + (response.data.cooldownSeconds || 60) * 1000;
                        localStorage.setItem(`otpCooldown_${trimmedEmail}`, expiry.toString());
                        setError("Account not verified. A new OTP has been sent. Redirecting to verification...");
                        setTimeout(() => {
                            router.push(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`);
                        }, 2500);
                    }
                } catch (err) {
                    if (err?.response?.status === 429) {
                        const remaining = err.response.data?.cooldownRemaining || 60;
                        const expiry = Date.now() + remaining * 1000;
                        localStorage.setItem(`otpCooldown_${trimmedEmail}`, expiry.toString());
                        setError(`Account not verified. An OTP was already sent recently (${remaining}s remaining). Redirecting...`);
                        setTimeout(() => {
                            router.push(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`);
                        }, 2500);
                    } else {
                        setError("Account not verified. Failed to send OTP. Please try again.");
                        setLoading(false);
                    }
                }
                return;
            }

            setError("Invalid credentials. Please try again.");
            setLoading(false);
            return;
        }

        // Handle Role Redirects logic
        const roleRedirects = {
            "admin": "/admindashboard",
            "user": "/dashboard",
        };

        if (result?.user?.role && roleRedirects[result.user.role]) {
            router.push(roleRedirects[result.user.role]);
        } else {
            router.push("/dashboard");
        }

        setLoading(false);
    };

    if (session) return null; // Prevent flash of login screen while redirecting

    const themeClasses = isLight
        ? {
            page: "relative min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/20 flex items-center justify-center p-6",
            card: "rounded-3xl p-8 md:p-10 shadow-2xl bg-white/85 border border-slate-200/80 backdrop-blur-xl",
            title: "text-3xl font-bold text-slate-950 mb-2",
            subtitle: "text-slate-600 text-sm",
            brand: "text-blue-600 font-medium",
            error: "mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 text-sm",
            label: "text-xs font-medium text-slate-600 ml-1 uppercase tracking-wider",
            icon: "text-slate-400 group-focus-within:text-blue-500 transition-colors",
            inputBase: "w-full bg-white border rounded-xl py-3 pl-12 pr-10 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all",
            inputNeutral: "border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/50",
            inputValid: "border-emerald-400/60 focus:border-emerald-500 focus:ring-emerald-500/40",
            inputInvalid: "border-red-300 focus:border-red-500 focus:ring-red-500/40",
            submit: "w-full py-4 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg shadow-slate-300/60 disabled:opacity-40 disabled:cursor-not-allowed",
            footer: "mt-8 text-center pt-6 border-t border-slate-200",
            footerLink: "text-slate-950 font-medium hover:text-blue-600 transition-colors",
            devButton: "mt-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 hover:text-slate-700 transition-colors",
        }
        : {
            page: "relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 flex items-center justify-center p-6",
            card: "rounded-3xl p-8 md:p-10 shadow-2xl bg-[#0A0A0A] border border-white/10",
            title: "text-3xl font-bold text-white mb-2",
            subtitle: "text-slate-400 text-sm",
            brand: "text-blue-400 font-medium",
            error: "mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm",
            label: "text-xs font-medium text-slate-300 ml-1 uppercase tracking-wider",
            icon: "text-slate-500 group-focus-within:text-blue-400 transition-colors",
            inputBase: "w-full bg-[#050505] border rounded-xl py-3 pl-12 pr-10 text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all",
            inputNeutral: "border-white/10 focus:border-blue-500/50 focus:ring-blue-500/50",
            inputValid: "border-green-500/30 focus:border-green-500/50 focus:ring-green-500/50",
            inputInvalid: "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50",
            submit: "w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg shadow-white/5 disabled:opacity-40 disabled:cursor-not-allowed",
            footer: "mt-8 text-center pt-6 border-t border-white/5",
            footerLink: "text-white font-medium hover:text-blue-400 transition-colors",
            devButton: "mt-4 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300 transition-colors",
        };

    return (
        <div className={themeClasses.page}>
            <GridBackground isLight={isLight} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <SpotlightCard className={themeClasses.card} isLight={isLight}>
                    <div className="text-center mb-10">
                        <h1 className={themeClasses.title}>Welcome Back</h1>
                        <p className={themeClasses.subtitle}>
                            Enter your credentials to access your <br />
                            <span className={themeClasses.brand}>Rezumix Intelligence Dashboard</span>
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={themeClasses.error}
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="space-y-2">
                            <label className={themeClasses.label}>Email</label>
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-3.5 w-5 h-5 ${themeClasses.icon}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={handleEmailBlur}
                                    placeholder="name@company.com"
                                    className={`${themeClasses.inputBase} ${emailTouched && !isEmailValid
                                        ? themeClasses.inputInvalid
                                        : emailTouched && isEmailValid
                                            ? themeClasses.inputValid
                                            : themeClasses.inputNeutral
                                        }`}
                                />
                                {emailTouched && (
                                    <div className="absolute right-4 top-3.5">
                                        {isEmailValid ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-400" />
                                        )}
                                    </div>
                                )}
                            </div>
                            {emailTouched && !isEmailValid && (
                                <p className={`text-xs ml-1 flex items-center gap-1.5 animate-fadeIn ${isLight ? "text-red-500" : "text-red-400"}`}>
                                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${isLight ? "bg-red-500" : "bg-red-400"}`} />
                                    Enter a valid email address (e.g. name@example.com)
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className={themeClasses.label}>Password</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-3.5 w-5 h-5 ${themeClasses.icon}`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className={`${themeClasses.inputBase} ${themeClasses.inputNeutral}`}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password || (emailTouched && !isEmailValid)}
                            className={themeClasses.submit}
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

                    <div className={themeClasses.footer}>
                        <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className={themeClasses.footerLink}>
                                Create Account
                            </Link>
                        </p>

                    </div>
                </SpotlightCard>
            </motion.div>
        </div>
    );
}