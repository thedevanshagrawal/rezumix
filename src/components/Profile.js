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
    X,
    Eye,
    EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from "@/lib/api-client";
import { PASSWORD_RULES, getPasswordStrength } from "@/lib/validation";
import { useThemeMode } from "@/hooks/use-theme-mode";
import ThemeToggle from "@/components/ThemeToggle";

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
            className={`relative overflow-hidden group ${className}`}
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
const GridBackground = ({ isLight }) => (
    <div className={`fixed inset-0 z-0 pointer-events-none ${isLight ? "bg-[#f8fafc]" : "bg-[#050505]"}`}>
        <div className={`absolute inset-0 ${isLight
            ? "bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"
        } bg-[size:32px_32px]`} />
        <div className={`absolute top-0 left-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-blue-400/10" : "bg-blue-600/5"}`} />
        <div className={`absolute bottom-0 right-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-indigo-300/10" : "bg-indigo-600/5"}`} />
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
    const { isLight } = useThemeMode();
    
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

    // Show/hide toggles for each password field
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            toast.error('Please correct the validation errors first');
            return;
        }

        setLoading(true);
        try {
            await apiClient.updateProfile(passwordChange);
            
            toast.success('Password Changed Successfully');

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
            
            toast.error(backendErrorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return null;

    return (
        <div className={`relative min-h-screen font-sans overflow-x-hidden ${isLight ? "bg-[#f8fafc] text-slate-900 selection:bg-blue-500/20" : "bg-[#050505] text-slate-200 selection:bg-blue-500/30"}`}>
            <ToastContainer />
            <GridBackground isLight={isLight} />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                <div className="flex justify-end mb-6">
                    <ThemeToggle />
                </div>

                {/* Header */}
                <div className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 ${isLight ? "bg-blue-500/10 border border-blue-200 text-blue-700" : "bg-blue-500/10 border border-blue-500/20 text-blue-400"}`}>
                        <Shield className="w-3 h-3" />
                        <span>Account Management</span>
                    </div>
                    <h1 className={`text-3xl md:text-5xl font-bold mb-6 tracking-tight ${isLight ? "text-slate-950" : "text-white"}`}>
                        Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Profile</span>
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        Manage your personal details and security preferences in one place.
                      </p>
                </div>

                {/* Main Spotlight Card */}
                <div className={`transition-all duration-700 delay-100 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <SpotlightCard className={`rounded-3xl p-8 md:p-12 shadow-2xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-white/10"}`}>
                        <div className="grid md:grid-cols-2 gap-12">

                            {/* 1. Profile Information Column */}
                            <div>
                                <div className={`flex items-center gap-3 mb-8 pb-4 ${isLight ? "border-b border-slate-200" : "border-b border-white/5"}`}>
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h2 className={`text-xl font-bold ${isLight ? "text-slate-950" : "text-white"}`}>Personal Details</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>Full Name</label>
                                        <div className="relative group">
                                            <User className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${isLight ? "text-slate-400 group-focus-within:text-blue-500" : "text-slate-500 group-focus-within:text-blue-400"}`} />
                                            <input
                                                type="text"
                                                value={userDetails.fullName}
                                                disabled
                                                className={`w-full rounded-xl py-3 pl-12 pr-4 cursor-not-allowed focus:outline-none ${isLight ? "bg-slate-50 border border-slate-200 text-slate-500" : "bg-[#111] border border-white/10 text-slate-400"}`}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>Email Address</label>
                                        <div className="relative group">
                                            <Mail className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${isLight ? "text-slate-400 group-focus-within:text-blue-500" : "text-slate-500 group-focus-within:text-blue-400"}`} />
                                            <input
                                                type="email"
                                                value={userDetails.email}
                                                disabled
                                                className={`w-full rounded-xl py-3 pl-12 pr-4 cursor-not-allowed focus:outline-none ${isLight ? "bg-slate-50 border border-slate-200 text-slate-500" : "bg-[#111] border border-white/10 text-slate-400"}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Security / Password Update Column */}
                            <div>
                                <div className={`flex items-center gap-3 mb-8 pb-4 ${isLight ? "border-b border-slate-200" : "border-b border-white/5"}`}>
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <h2 className={`text-xl font-bold ${isLight ? "text-slate-950" : "text-white"}`}>Security Settings</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>Current Password</label>
                                        <div className="relative group">
                                            <Lock className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${isLight ? "text-slate-400 group-focus-within:text-indigo-500" : "text-slate-500 group-focus-within:text-indigo-400"}`} />
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={passwordChange.currentPassword}
                                                onBlur={() => handleBlur("currentPassword")}
                                                onChange={(e) => setPasswordChange({ ...passwordChange, currentPassword: e.target.value })}
                                                className={`w-full rounded-xl py-3 pl-12 pr-10 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-500 ${isLight ? "bg-white text-slate-900 border-slate-200" : "bg-[#111] text-white border-white/10"} ${
                                                className={`w-full bg-[#111] border rounded-xl py-3 pl-12 pr-20 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${
                                                    touched.currentPassword && !validation.currentPassword.valid
                                                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
                                                        : touched.currentPassword && validation.currentPassword.valid
                                                        ? "border-green-500/30 focus:border-green-500/50 focus:ring-green-500/50"
                                                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                                                }`}
                                            />
                                            {/* Show/Hide toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword((v) => !v)}
                                                className={`absolute top-3.5 text-slate-500 hover:text-indigo-400 transition-colors focus:outline-none ${
                                                    touched.currentPassword ? "right-12" : "right-4"
                                                }`}
                                                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                            {/* Validation icon */}
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
                                        <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>New Password</label>
                                        <div className="relative group">
                                            <Lock className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${isLight ? "text-slate-400 group-focus-within:text-indigo-500" : "text-slate-500 group-focus-within:text-indigo-400"}`} />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={passwordChange.newPassword}
                                                onBlur={() => handleBlur("newPassword")}
                                                onChange={(e) => setPasswordChange({ ...passwordChange, newPassword: e.target.value })}
                                                className={`w-full rounded-xl py-3 pl-12 pr-10 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-500 ${isLight ? "bg-white text-slate-900 border-slate-200" : "bg-[#111] text-white border-white/10"} ${
                                                className={`w-full bg-[#111] border rounded-xl py-3 pl-12 pr-20 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${
                                                    touched.newPassword && !validation.newPassword.valid
                                                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
                                                        : touched.newPassword && validation.newPassword.valid
                                                        ? "border-green-500/30 focus:border-green-500/50 focus:ring-green-500/50"
                                                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                                                }`}
                                            />
                                            {/* Show/Hide toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword((v) => !v)}
                                                className={`absolute top-3.5 text-slate-500 hover:text-indigo-400 transition-colors focus:outline-none ${
                                                    touched.newPassword ? "right-12" : "right-4"
                                                }`}
                                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                            {/* Validation icon */}
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
                                        <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>Confirm New Password</label>
                                        <div className="relative group">
                                            <Lock className={`absolute left-4 top-3.5 w-5 h-5 transition-colors ${isLight ? "text-slate-400 group-focus-within:text-indigo-500" : "text-slate-500 group-focus-within:text-indigo-400"}`} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                value={passwordChange.confirmPassword}
                                                onBlur={() => handleBlur("confirmPassword")}
                                                onChange={(e) => setPasswordChange({ ...passwordChange, confirmPassword: e.target.value })}
                                                className={`w-full rounded-xl py-3 pl-12 pr-10 focus:outline-none focus:ring-1 transition-all placeholder:text-slate-500 ${isLight ? "bg-white text-slate-900 border-slate-200" : "bg-[#111] text-white border-white/10"} ${
                                                className={`w-full bg-[#111] border rounded-xl py-3 pl-12 pr-20 text-white focus:outline-none focus:ring-1 transition-all placeholder:text-slate-600 ${
                                                    touched.confirmPassword && !validation.confirmPassword.valid
                                                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50"
                                                        : touched.confirmPassword && validation.confirmPassword.valid
                                                        ? "border-green-500/30 focus:border-green-500/50 focus:ring-green-500/50"
                                                        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/50"
                                                }`}
                                            />
                                            {/* Show/Hide toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                                className={`absolute top-3.5 text-slate-500 hover:text-indigo-400 transition-colors focus:outline-none ${
                                                    touched.confirmPassword ? "right-12" : "right-4"
                                                }`}
                                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                            {/* Validation icon */}
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
                                                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${loading || !validation.isFormValid
                                                    ? isLight
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-60'
                                                        : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5 opacity-40'
                                                    : isLight
                                                        ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-[0_0_20px_-5px_rgba(15,23,42,0.25)]'
                                                        : 'bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]'
                                                }`}
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