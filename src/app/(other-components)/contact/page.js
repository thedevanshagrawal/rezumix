"use client";
import { useState } from "react";
import { motion } from "framer-motion";
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
import SpotlightCard from "@/components/ui/SpotlightCard";
import GridBackground from "@/components/ui/GridBackground";

// --- Main Component ---

export default function ContactPage() {
    const [name, setName] = useState("");
    const [useremail, setUserEmail] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
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
            if (error.response?.data?.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("Something went wrong. Please try again.");
            }
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
        <div className="relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">

            <GridBackground />

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">

                {/* Header */}
                <div className="text-center lg:text-left mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
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
                        className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0"
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
                                <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${info.color}`}>
                                    <info.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">
                                        {info.title}
                                    </h3>
                                    <p className="text-xl font-semibold text-white">
                                        {info.content}
                                    </p>
                                </div>
                            </SpotlightCard>
                        ))}

                        {/* Mini FAQ */}
                        <div className="mt-12 p-8 border border-white/5 rounded-3xl bg-white/[0.02]">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" /> Quick Answers
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-1">How fast is the analysis?</h4>
                                    <p className="text-xs text-slate-500">Usually under 30 seconds for a full resume audit.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

                        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                                    <div className="relative">
                                        <AtSign className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                        <input
                                            type="email"
                                            required
                                            value={useremail}
                                            onChange={(e) => setUserEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Message</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                                    <textarea
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="How can we help you today?"
                                        rows={5}
                                        className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
                                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Message sent! We&apos;ll be in touch soon.</span>
                                </motion.div>
                            )}

                            {status === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span className="text-sm font-medium">{errorMessage}</span>
                                </motion.div>
                            )}

                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}