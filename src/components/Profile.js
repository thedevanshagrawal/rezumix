"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    User,
    Mail,
    Lock,
    Shield,
    Loader2,
    Eye,
    EyeOff
} from 'lucide-react';

import {
    toast,
    ToastContainer
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "@/lib/api-client";

// Reuse GridBackground
const GridBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-indigo-600/5 blur-[120px] rounded-full mix-blend-screen" />
    </div>
);

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

    // Password visibility states
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

    const handleChangePassword = async () => {

        if (passwordChange.newPassword !== passwordChange.confirmPassword) {

            toast.error('New passwords do not match', {
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

        } catch (error) {

            console.log("error: ", error);

            toast.error('Failed to change password', {
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
                <div
                    className={`text-center mb-12 transition-all duration-700 ease-out ${isVisible
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-8'
                        }`}
                >

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                        <Shield className="w-3 h-3" />
                        <span>Account Management</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Your{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                            Profile
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Manage your personal details and security preferences in one place.
                    </p>

                </div>

                {/* Main Card */}
                <div
                    className={`bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative transition-all duration-700 delay-100 ease-out ${isVisible
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-8'
                        }`}
                >

                    <div className="grid md:grid-cols-2 gap-12">

                        {/* Personal Details */}
                        <div>

                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">

                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>

                                <h2 className="text-xl font-bold text-white">
                                    Personal Details
                                </h2>

                            </div>

                            <div className="space-y-6">

                                {/* Full Name */}
                                <div className="space-y-2">

                                    <label className="text-sm font-medium text-slate-300 ml-1">
                                        Full Name
                                    </label>

                                    <div className="relative group">

                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

                                        <input
                                            type="text"
                                            value={userDetails.fullName}
                                            disabled
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-400 cursor-not-allowed focus:outline-none"
                                        />

                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">

                                    <label className="text-sm font-medium text-slate-300 ml-1">
                                        Email Address
                                    </label>

                                    <div className="relative group">

                                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

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

                        {/* Security */}
                        <div>

                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">

                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Lock className="w-5 h-5" />
                                </div>

                                <h2 className="text-xl font-bold text-white">
                                    Security
                                </h2>

                            </div>

                            <div className="space-y-6">

                                {/* Current Password */}
                                <div className="space-y-2">

                                    <label className="text-sm font-medium text-slate-300 ml-1">
                                        Current Password
                                    </label>

                                    <div className="relative group">

                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={passwordChange.currentPassword}
                                            onChange={(e) =>
                                                setPasswordChange({
                                                    ...passwordChange,
                                                    currentPassword: e.target.value
                                                })
                                            }
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCurrentPassword(!showCurrentPassword)
                                            }
                                            className="absolute right-4 top-3 text-slate-400"
                                        >
                                            {showCurrentPassword
                                                ? <EyeOff size={20} />
                                                : <Eye size={20} />
                                            }
                                        </button>

                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">

                                    <label className="text-sm font-medium text-slate-300 ml-1">
                                        New Password
                                    </label>

                                    <div className="relative group">

                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={passwordChange.newPassword}
                                            onChange={(e) =>
                                                setPasswordChange({
                                                    ...passwordChange,
                                                    newPassword: e.target.value
                                                })
                                            }
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword(!showNewPassword)
                                            }
                                            className="absolute right-4 top-3 text-slate-400"
                                        >
                                            {showNewPassword
                                                ? <EyeOff size={20} />
                                                : <Eye size={20} />
                                            }
                                        </button>

                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">

                                    <label className="text-sm font-medium text-slate-300 ml-1">
                                        Confirm New Password
                                    </label>

                                    <div className="relative group">

                                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />

                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={passwordChange.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordChange({
                                                    ...passwordChange,
                                                    confirmPassword: e.target.value
                                                })
                                            }
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }
                                            className="absolute right-4 top-3 text-slate-400"
                                        >
                                            {showConfirmPassword
                                                ? <EyeOff size={20} />
                                                : <Eye size={20} />
                                            }
                                        </button>

                                    </div>
                                </div>

                                {/* Button */}
                                <div className="pt-2">

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={
                                            loading ||
                                            !passwordChange.currentPassword ||
                                            !passwordChange.newPassword ||
                                            !passwordChange.confirmPassword
                                        }
                                        className={`
                                            w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                                            ${loading ||
                                                !passwordChange.currentPassword ||
                                                !passwordChange.newPassword ||
                                                !passwordChange.confirmPassword
                                                ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
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
                </div>
            </div>
        </div>
    );
};

export default Profile;