"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    Mail,
    ArrowLeft,
    Loader2,
    Send,
    ShieldCheck,
    Lock,
    Eye,
    EyeOff
} from "lucide-react";

export default function ForgotPasswordPage() {

    const router = useRouter();

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    // Show/hide toggles for each password field
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // SEND OTP
    const handleSendOTP = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await fetch("/api/user/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                setStep(2);
            } else {
                toast.error(data.message);
            }

        } catch (error) {

            console.log(error);

            toast.error("Something went wrong");
        }

        setLoading(false);
    };

    // RESET PASSWORD
    const handleResetPassword = async (e) => {

        e.preventDefault();

        if (newPassword !== confirmPassword) {

            toast.error("Passwords do not match");

            return;
        }

        setLoading(true);

        try {

            const response = await fetch("/api/user/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword
                }),
            });

            const data = await response.json();

            if (data.success) {

                toast.success(data.message);

                setTimeout(() => {
                    router.push("/login");
                }, 1500);

            } else {

                toast.error(data.message);
            }

        } catch (error) {

            console.log(error);

            toast.error("Something went wrong");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >

                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>

                <div className="mb-8">

                    <h1 className="text-3xl font-bold mb-3">
                        Forgot Password
                    </h1>

                    <p className="text-slate-400 text-sm leading-relaxed">
                        {step === 1
                            ? "Enter your registered email address to receive an OTP."
                            : "Enter the OTP and set your new password."
                        }
                    </p>

                </div>

                {/* STEP 1 */}

                {step === 1 && (

                    <form
                        onSubmit={handleSendOTP}
                        className="space-y-5"
                    >

                        <div className="space-y-2">

                            <label className="text-xs uppercase tracking-wider text-slate-400">
                                Email Address
                            </label>

                            <div className="relative">

                                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                        >

                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending OTP...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send OTP
                                </>
                            )}

                        </button>

                    </form>
                )}

                {/* STEP 2 */}

                {step === 2 && (

                    <form
                        onSubmit={handleResetPassword}
                        className="space-y-5"
                    >

                        <div className="space-y-2">

                            <label className="text-xs uppercase tracking-wider text-slate-400">
                                OTP
                            </label>

                            <div className="relative">

                                <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />

                            </div>

                        </div>

                        <div className="space-y-2">

                            <label className="text-xs uppercase tracking-wider text-slate-400">
                                New Password
                            </label>

                            <div className="relative">

                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((v) => !v)}
                                    className="absolute right-4 top-3.5 text-slate-500 hover:text-blue-400 transition-colors focus:outline-none"
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>

                            </div>

                        </div>

                        <div className="space-y-2">

                            <label className="text-xs uppercase tracking-wider text-slate-400">
                                Confirm Password
                            </label>

                            <div className="relative">

                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="absolute right-4 top-3.5 text-slate-500 hover:text-blue-400 transition-colors focus:outline-none"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>

                            </div>

                        </div>

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !otp ||
                                !newPassword ||
                                !confirmPassword
                            }
                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
                        >

                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Reset Password
                                </>
                            )}

                        </button>

                    </form>
                )}

            </motion.div>
        </div>
    );
}