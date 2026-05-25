"use client";
import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { useThemeMode } from "@/hooks/use-theme-mode";
import {
    FileSearch,
    Compass,
    Brain,
    Mic,
    Target,
    Zap,
    ShieldCheck,
    Cpu,
    ArrowRight
} from "lucide-react";

// --- Components (Reused from Home for consistency) ---

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

// --- Data ---

const features = [
    {
        title: "Resume Analyzer",
        description: "Our smart AI acts like a recruiter, pointing out exactly what's great and what needs work to beat the ATS bots.",
        icon: FileSearch,
        colSpan: "md:col-span-2",
    },
    {
        title: "Career Compass",
        description: "Confused? We analyze your skills and interests to recommend careers that actually match who you are.",
        icon: Compass,
        colSpan: "md:col-span-1",
    },
    {
        title: "Personality Fit",
        description: "Understand how you work best, what motivates you, and the team dynamics where you'll thrive.",
        icon: Brain,
        colSpan: "md:col-span-1",
    },
    {
        title: "Mock Interviewer",
        description: "Practice with our AI voice coach. Get real questions and instant feedback on your answers.",
        icon: Mic,
        colSpan: "md:col-span-1",
    },
    {
        title: "Skill Gap Identifier",
        description: "See the exact skills you're missing for your dream job and get a roadmap to learn them.",
        icon: Target,
        colSpan: "md:col-span-1",
    },
];

const stats = [
    { number: "50k+", label: "Resumes Analyzed" },
    { number: "95%", label: "ATS Pass Rate" },
    { number: "4.9★", label: "User Rating" },
    { number: "10k+", label: "Career Pivots" },
];

export default function About() {
    const { isLight } = useThemeMode();

    return (
        <div className={`relative min-h-screen font-sans overflow-x-hidden ${isLight ? "bg-[#f8fafc] text-slate-900 selection:bg-blue-500/20" : "bg-[#050505] text-slate-200 selection:bg-blue-500/30"}`}>

            <GridBackground isLight={isLight} />

            {/* 1. Hero Section */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className={`text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] ${isLight ? "text-slate-950" : "text-white"}`}>
                            Empowering Careers with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                Artificial Intelligence.
                            </span>
                        </h1>

                        <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-16 leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            Rezumix is transforming how professionals approach their careers.
                            We are democratizing access to top-tier career intelligence that was
                            once available only to executives.
                        </p>
                    </motion.div>

                    {/* Stats Strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className={`grid grid-cols-2 md:grid-cols-4 gap-8 py-12 backdrop-blur-sm ${isLight ? "border-y border-slate-200 bg-white/70" : "border-y border-white/5 bg-white/5"}`}
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <span className={`text-3xl md:text-4xl font-bold mb-2 ${isLight ? "text-slate-950" : "text-white"}`}>{stat.number}</span>
                                <span className={`text-xs uppercase tracking-wider font-medium ${isLight ? "text-slate-500" : "text-slate-500"}`}>{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 2. Mission Section */}
            <section className="relative z-10 py-24 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className={`text-3xl md:text-5xl font-bold ${isLight ? "text-slate-950" : "text-white"}`}>Our Mission</h2>
                        <p className={`text-lg leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            We believe every professional deserves a fair shot at their dream job.
                            Recruitment has become automated, so your application strategy should be too.
                        </p>
                        <p className={`text-lg leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            Our mission is to build the ultimate <strong>Career Operating System</strong>—a
                            suite of tools that helps you navigate from your first internship to the C-Suite.
                        </p>
                    </motion.div>

                    {/* Abstract Visual "System Status" Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className={`absolute inset-0 blur-[80px] rounded-full ${isLight ? "bg-blue-300/20" : "bg-blue-500/20"}`} />
                        <div className={`relative rounded-2xl p-8 backdrop-blur-xl ${isLight ? "bg-white border border-slate-200 shadow-sm" : "bg-neutral-900 border border-white/10"}`}>
                            <div className={`flex items-center justify-between mb-8 pb-4 ${isLight ? "border-b border-slate-200" : "border-b border-white/5"}`}>
                                <span className="text-sm font-mono text-slate-500">SYSTEM_GOALS.JSON</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "Democratize Success", progress: "100%" },
                                    { label: "Remove Bias", progress: "94%" },
                                    { label: "Skill Transparency", progress: "98%" }
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className={`flex justify-between text-sm mb-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                                            <span>{item.label}</span>
                                            <span className="text-blue-400">{item.progress}</span>
                                        </div>
                                        <div className={`h-2 rounded-full overflow-hidden ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: item.progress }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-blue-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* 3. Features Bento Grid */}
            <section className={`relative z-10 py-24 px-6 ${isLight ? "bg-white/70 border-y border-slate-200" : "bg-neutral-900/20 border-y border-white/5"}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${isLight ? "text-slate-950" : "text-white"}`}>What Makes Us Different</h2>
                        <p className={`text-lg ${isLight ? "text-slate-600" : "text-slate-400"}`}>Not just a resume builder. A full career engine.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                        {features.map((feature, idx) => (
                            <SpotlightCard
                                key={idx}
                                className={`${feature.colSpan} p-8 rounded-3xl flex flex-col justify-between ${isLight ? "bg-white border border-slate-200 shadow-sm" : "bg-neutral-900"}`}
                            >
                                <div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${isLight ? "bg-slate-100 border border-slate-200 text-slate-900" : "bg-white/5 border border-white/10 text-white"}`}>
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className={`text-xl font-bold mb-3 ${isLight ? "text-slate-950" : "text-white"}`}>{feature.title}</h3>
                                    <p className={`leading-relaxed text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                                        {feature.description}
                                    </p>
                                </div>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Core Values (Story) */}
            <section className="relative z-10 py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className={`text-3xl md:text-5xl font-bold ${isLight ? "text-slate-950" : "text-white"}`}>Built for the Future of Work</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Lightning Fast", desc: "Analysis in seconds, not days.", icon: Zap },
                            { title: "Data Driven", desc: "Insights from 10M+ job descriptions.", icon: Cpu },
                            { title: "Private & Secure", desc: "Your career data belongs to you.", icon: ShieldCheck }
                        ].map((item, i) => (
                            <SpotlightCard key={i} isLight={isLight} className={`p-8 rounded-2xl text-center ${isLight ? "bg-white" : "bg-neutral-900/30"}`}>
                                <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-400">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className={`text-xl font-bold mb-3 ${isLight ? "text-slate-950" : "text-white"}`}>{item.title}</h3>
                                <p className={isLight ? "text-slate-600" : "text-slate-400"}>{item.desc}</p>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. CTA Section */}
            <section className="relative z-10 py-20 px-6 pb-32">
                <div className="max-w-4xl mx-auto relative">
                    <div className={`absolute inset-0 blur-[100px] rounded-full ${isLight ? "bg-blue-300/15" : "bg-blue-600/10"}`} />

                    <div className={`relative rounded-3xl p-12 text-center overflow-hidden ${isLight ? "bg-white border border-slate-200 shadow-sm" : "bg-[#0A0A0A] border border-white/10"}`}>
                        <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${isLight ? "text-slate-950" : "text-white"}`}>
                            Ready to Upgrade Your Career?
                        </h2>
                        <p className={`text-lg mb-10 max-w-xl mx-auto ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                            Join thousands of professionals who have already transformed their careers with Rezumix.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/login">
                                <button className={`w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer ${isLight ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-white text-black hover:bg-slate-200"}`}>
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}