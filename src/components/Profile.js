"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Lock,
    CheckCircle,
    AlertCircle,
    Shield,
    Loader2,
    Check,
    X
} from 'lucide-react';
import {
    toast,
    ToastContainer
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "@/lib/api-client";
import { PASSWORD_RULES, getPasswordStrength } from "@/lib/validation";

// Spotlight Card Component for consistent aesthetic
function SpotlightCard({ children, className = "" }) {
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }, []);

    return (
        <div
            className={`relative border border-white/10 bg-[#0A0A0A] overflow-hidden group ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && (
                <div
                    className="pointer-events-none absolute -inset-px rounded-3xl transition duration-300"
                    style={{
                        background: `radial-gradient(650px circle at ${coords.x}px ${coords.y}px, rgba(59, 130, 246, 0.1), transparent 80%)`
                    }}
                />
            )}
            <div className="relative h-full z-10">{children}</div>
        </div>
    );
}

// 2. Background Component
const GridBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-indigo-600/5 blur-[120px] rounded-full mix-blend-screen" />
    </div>
);

// --- Password Strength Meter Component (shared logic) ---
function PasswordStrengthMeter({ password }) {
    const strength = getPasswordStrength(password);

    if (!password) return null;

    return (
        <div className="mt-3 space-y-3">
            {/* Strength bar */}
            <div className="flex items-center gap-3">
                <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                level <= strength.score ? strength.color : "bg-white/10"
                            }`}
                        />
                    ))}
                </div>
                <span className={`text-xs font-medium min-w-[70px] text-right transition-colors duration-300 ${
                    strength.score <= 1 ? "text-red-400" :
                    strength.score === 2 ? "text-orange-400" :
                    strength.score === 3 ? "text-yellow-400" :
                    strength.score === 4 ? "text-blue-400" : "text-green-400"
                }`}>
                    {strength.label}
                </span>
            </div>

            {/* Criteria checklist */}
            <div className="space-y-1.5">
                {PASSWORD_RULES.map((criteria) => {
                    const passed = criteria.test(password);
                    return (
                        <div
                            key={criteria.key}
                            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                                passed ? "text-green-400" : "text-slate-500"
                            }`}
                        >
                            {passed ? (
                                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                            ) : (
                                <X className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            <span>{criteria.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const Profile = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    
    const [passwordChange, setPasswordChange] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [userDetails, setUserDetails] = useState({
        fullName: '',
        email: '',
        username: ''
    });

    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Track focused/touched inputs for active feedback
    const [touched, setTouched] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    useEffect(() => {
        if (status === "loading") return;

        if (!session || status === "unauthenticated") {
            router.push("/");
        } else {
            setUserDetails({
                fullName: session.user?.fullName || '',
                email: session.user?.email || '',
                username: session.user?.username || ''
            });
            setTimeout(() => setIsVisible(true), 300);
        }
    }, [router, session, status]);

    // --- Validation logic ---
    const validation = useMemo(() => {
        const isCurrentValid = passwordChange.currentPassword.length > 0;
        const isNewValid = PASSWORD_RULES.every((c) => c.test(passwordChange.newPassword));
        const isConfirmValid = passwordChange.confirmPassword === passwordChange.newPassword && passwordChange.confirmPassword.length > 0;

        return {
            currentPassword: {
                valid: isCurrentValid,
                message: touched.currentPassword && !isCurrentValid ? "Current password is required" : ""
            },
            newPassword: {
                valid: isNewValid,
                message: touched.newPassword && !isNewValid ? "Password must meet all strength criteria" : ""
            },
            confirmPassword: {
                valid: isConfirmValid,
                message: touched.confirmPassword && !isConfirmValid ? "New passwords do not match" : ""
            },
            isFormValid: isCurrentValid && isNewValid && isConfirmValid
        };
    }, [passwordChange, touched]);

    const handleBlur = useCallback((field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    const handleChangePassword = async () => {
        // Mark all fields as touched to show errors if any
        setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

        if (!validation.isFormValid) {
            toast.error('Please correct the validation errors first', {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
            });
            return;
        }

        setLoading(true);
        try {
            const email = session.user?.email;
            await apiClient.updateProfile(email, passwordChange);
            
            toast.success('Password Changed Successfully', {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
            });

            setPasswordChange({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            setTouched({
                currentPassword: false,
                newPassword: false,
                confirmPassword: false
            });

        } catch (error) {
            console.log("error: ", error);
            
            // Extract structured error from backend validation
            const backendErrorMsg = error.response?.data?.errors?.[0]?.messages?.[0] || error.response?.data?.message || 'Failed to change password';
            
            toast.error(backendErrorMsg, {
                position: "top-right",
                autoClose: 3000,
                theme: "dark",
            });
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return null;

    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
            <ToastContainer />
            <GridBackground />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">

                {/* Header */}
                <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                        <Shield className="w-3 h-3" />
                        <span>Account Management</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Profile</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Manage your personal details and security preferences in one place.
                      </p>
                </div>

                {/* Main Spotlight Card */}
                <div className={`transition-all duration-700 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <SpotlightCard className="rounded-3xl p-8 md:p-12 shadow-2xl">
                        <div className="grid md:grid-cols-2 gap-12">

                            {/* 1. Profile Information Column */}
                            <div>
                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Personal Details</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={userDetails.fullName}
                                                disabled
                                                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-400 cursor-not-allowed focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="email"
                                                value={userDetails.email}
                                                disabled
                                                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-400 cursor-not-allowed focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Security / Password Update Column */}
                            <div>
                                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Security Settings</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Current Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwordChange.currentPassword}
                                                onBlur={() => handleBlur("currentPassword")}
                                                onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
                                                className={`w-full bg-[#111] border rounded-xl py-3 pl-12 pr-10 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${
                                                    touched.currentPassword && !validation.currentPassword.valid
                                                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
                                                        : touched.currentPassword && validation.currentPassword.valid
                                                        ? "border-green-500/30 focus:border-green-500/50 focus:ring-green-500/50"
                                                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                                                }`}
                                            />
                                            {touched.currentPassword && (
                                                <div className="absolute right-4 top-3.5">
                                                    {validation.currentPassword.valid ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {touched.currentPassword && validation.currentPassword.message && (
                                            <p className="text-xs text-red-400 ml-1 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                                                {validation.currentPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwordChange.newPassword}
                                                onBlur={() => handleBlur("newPassword")}
                                                onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                                                className={`w-full bg-[#111] border rounded-xl py-3 pl-12 pr-10 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${
                                                    touched.newPassword && !validation.newPassword.valid
                                                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
                                                        : touched.newPassword && validation.newPassword.valid
                                                        ? "border-green-500/30 focus:border-green-500/50 focus:ring-green-500/50"
                                                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                                                }`}
                                            />
                                            {touched.newPassword && (
                                                <div className="absolute right-4 top-3.5">
                                                    {validation.newPassword.valid ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {/* Real-time checklist and strength meter */}
                                        <PasswordStrengthMeter password={passwordChange.newPassword} />
                                    </div>

                                    {/* Confirm New Password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300 ml-1">Confirm New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwordChange.confirmPassword}
                                                onBlur={() => handleBlur("confirmPassword")}
                                                onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                                                className={`w-full bg-[#111] border rounded-xl py-3 pl-12 pr-10 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${
                                                    touched.confirmPassword && !validation.confirmPassword.valid
                                                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
                                                        : touched.confirmPassword && validation.confirmPassword.valid
                                                        ? "border-green-500/30 focus:border-green-500/50 focus:ring-green-500/50"
                                                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                                                }`}
                                            />
                                            {touched.confirmPassword && (
                                                <div className="absolute right-4 top-3.5">
                                                    {validation.confirmPassword.valid ? (
                                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {touched.confirmPassword && validation.confirmPassword.message && (
                                            <p className="text-xs text-red-400 ml-1 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                                                {validation.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-2">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={loading || !validation.isFormValid}
                                            className={`
                                                w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                                ${loading || !validation.isFormValid
                                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5 opacity-40'
                                                    : 'bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]'
                                                }
                                            `}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
};

export default Profile;