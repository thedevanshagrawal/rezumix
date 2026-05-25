"use client";
import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
    Mail,
    Clock,
    Headphones,
    Send,
    User,
    AtSign,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Zap
} from "lucide-react";
import axios from "axios";
import { useThemeMode } from "@/hooks/use-theme-mode";

// --- Components ---

// 1. Spotlight Card
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
            className={`relative overflow-hidden group ${isLight ? "border border-slate-200 bg-white shadow-sm" : "border border-white/10 bg-neutral-900/50"} ${className}`}
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
        <div className={`absolute top-0 left-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-blue-400/10 mix-blend-multiply" : "bg-blue-600/5 mix-blend-screen"}`} />
        <div className={`absolute bottom-0 right-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-purple-400/10 mix-blend-multiply" : "bg-purple-600/5 mix-blend-screen"}`} />
    </div>
);

// --- Main Component ---

export default function ContactPage() {
    const { isLight } = useThemeMode();
    const [name, setName] = useState("");
    const [useremail, setUserEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("/api/user/contact", { name, useremail, message });
            if (res.status === 200) {
                setStatus("success");
                setName("");
                setUserEmail("");
                setMessage("");
            }
        } catch (error) {
            setStatus("error");
        } finally {
            setLoading(false);
            setTimeout(() => setStatus(""), 5000); // ✅ Auto-clear status after 5s
        }
    };

    const contactInfo = [
        {
            title: "Email Support",
            content: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@rezumix.com",
            icon: Mail,
            color: "text-blue-400"
        },
        {
            title: "Response Time",
            content: "Within 24 hours",
            icon: Clock,
            color: "text-purple-400"
        },
        {
            title: "Availability",
            content: "24/7 AI Support",
            icon: Headphones,
            color: "text-green-400"
        }
    ];

    return (
        <div className={`relative min-h-screen font-sans overflow-x-hidden ${isLight ? "bg-[#f8fafc] text-slate-900 selection:bg-blue-500/20" : "bg-[#050505] text-slate-200 selection:bg-blue-500/30"}`}>

            <GridBackground isLight={isLight} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">

                {/* Header */}
                <div className="text-center lg:text-left mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-4xl md:text-6xl font-bold mb-6 tracking-tight ${isLight ? "text-slate-950" : "text-white"}`}
                    >
                        Let&apos;s start a <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            Conversation.
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`text-lg max-w-2xl mx-auto lg:mx-0 ${isLight ? "text-slate-600" : "text-slate-400"}`}
                    >
                        Whether you need technical support, have feature requests, or just want
                        to discuss your career path, our team and AI agents are ready.
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* LEFT COLUMN: Info Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {contactInfo.map((info, idx) => (
                            <SpotlightCard key={idx} className="p-6 rounded-2xl flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLight ? "bg-slate-100 border border-slate-200" : "bg-white/5 border border-white/10"} ${info.color}`}>
                                    <info.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-medium uppercase tracking-wider mb-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                        {info.title}
                                    </h3>
                                    <p className={`text-xl font-semibold ${isLight ? "text-slate-950" : "text-white"}`}>
                                        {info.content}
                                    </p>
                                </div>
                            </SpotlightCard>
                        ))}

                        {/* Mini FAQ */}
                        <div className={`mt-12 p-8 rounded-3xl ${isLight ? "border border-slate-200 bg-white shadow-sm" : "border border-white/5 bg-white/[0.02]"}`}>
                            <h3 className={`font-bold mb-6 flex items-center gap-2 ${isLight ? "text-slate-950" : "text-white"}`}>
                                <Zap className="w-5 h-5 text-yellow-400" /> Quick Answers
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className={`text-sm font-semibold mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}>How fast is the analysis?</h4>
                                    <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-500"}`}>Usually under 30 seconds for a full resume audit.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`relative overflow-hidden rounded-3xl p-8 md:p-10 shadow-2xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-white/10"}`}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className={`w-full rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-1 transition-all ${isLight ? "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20" : "bg-[#111] border border-white/10 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-blue-500/50"}`}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>Email</label>
                                    <div className="relative">
                                        <AtSign className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input
                                            type="email"
                                            required
                                            value={useremail}
                                            onChange={(e) => setUserEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className={`w-full rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-1 transition-all ${isLight ? "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20" : "bg-[#111] border border-white/10 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-blue-500/50"}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}>Message</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How can we help you today?"
                                        rows={5}
                                        className={`w-full rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-1 transition-all resize-none ${isLight ? "bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20" : "bg-[#111] border border-white/10 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-blue-500/50"}`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${isLight ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-white text-black hover:bg-slate-200"}`}
                            >
                                {loading ? (
                                    <span className="animate-pulse">Sending...</span>
                                ) : (
                                    <>
                                        Send Message <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>

                            {/* Status Messages */}
                            {status === "success" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl flex items-center gap-3 ${isLight ? "bg-green-50 border border-green-200 text-green-700" : "bg-green-500/10 border border-green-500/20 text-green-400"}`}
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Message sent! We&apos;ll be in touch soon.</span>
                                </motion.div>
                            )}

                            {status === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl flex items-center gap-3 ${isLight ? "bg-red-50 border border-red-200 text-red-700" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}
                                >
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Something went wrong. Please try again.</span>
                                </motion.div>
                            )}

                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}