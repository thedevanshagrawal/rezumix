"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
    User,
    Mail,
    Lock,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    Star,
    ArrowLeft,
    Eye,
    EyeOff
} from "lucide-react";

// --- Components ---

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
            className={`relative border border-white/10 bg-neutral-900/50 overflow-hidden group ${className}`}
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

const GridBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
    </div>
);

// --- Main Page ---
export default function Register() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loaded, setLoaded] = useState(false);
    useEffect(() => setLoaded(true), []);

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await axios.post("/api/user/register", {
                fullName,
                email,
                password
            });

            if (response.status === 200) {
                setSuccess("Registration successful! Redirecting...");
                setFullName("");
                setEmail("");
                setPassword("");

                setTimeout(() => {
                    router.push("/verify-otp");
                }, 2000);
            }
        } catch (err) {
            if (err?.response?.status === 404) {
                setError("User already registered. Please log in.");
            } else {
                setError("An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const features = [
        "AI-Powered Resume Analysis",
        "Personalized Career Recommendations",
        "Mock Interview Practice",
        "Personality Prediction",
        "Skill Gap Identifier"
    ];

    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-200 overflow-x-hidden">

            <GridBackground />

            <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-20">

                {/* Back */}
                <div className="max-w-6xl mx-auto w-full mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Homepage
                    </Link>
                </div>

                <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

                    {/* LEFT */}
                    <div className={`${loaded ? "opacity-100" : "opacity-0"} transition-all duration-700`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs mb-6">
                            <Sparkles className="w-3 h-3" />
                            Join the AI Revolution
                        </div>

                        <h1 className="text-4xl font-bold text-white mb-6">
                            Accelerate your career with{" "}
                            <span className="text-blue-400">Intelligence</span>
                        </h1>

                        <div className="space-y-3 text-slate-300">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <SpotlightCard className="rounded-3xl p-8 bg-[#0A0A0A]">

                        <h2 className="text-2xl font-bold text-white mb-6 text-center">
                            Create Account
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* NAME */}
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 text-white"
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 text-white"
                                />
                            </div>

                            {/* PASSWORD WITH TOGGLE */}
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-[#050505] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* ERROR / SUCCESS */}
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            {success && <p className="text-green-400 text-sm">{success}</p>}

                            {/* BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black py-3 rounded-xl font-bold flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Get Started <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                        </form>

                        <p className="text-center text-sm text-slate-400 mt-6">
                            Already have an account?{" "}
                            <Link href="/login" className="text-white">
                                Sign In
                            </Link>
                        </p>

                    </SpotlightCard>

                </div>
            </div>
        </div>
    );
}