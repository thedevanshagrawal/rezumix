"use client";
import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
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

// 2. Background Pattern
const GridBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
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
    { end: 50, suffix: "k+", label: "Resumes Analyzed" },
    { end: 95, suffix: "%", label: "ATS Pass Rate" },
    { end: 4.9, suffix: "★", label: "User Rating", decimals: 1 },
    { end: 10, suffix: "k+", label: "Career Pivots" },
];

export default function About() {
    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">

            <GridBackground />

            {/* 1. Hero Section */}
            <section className="relative z-10 pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
                            Empowering Careers with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                Artificial Intelligence.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-16 leading-relaxed">
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
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/5 py-12 bg-white/5 backdrop-blur-sm"
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <span className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    <CountUp
                                        end={stat.end}
                                        duration={2}
                                        suffix={stat.suffix}
                                        decimals={stat.decimals || 0}
                                        enableScrollSpy
                                        scrollSpyOnce
                                    />
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">{stat.label}</span>
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
                        <h2 className="text-3xl md:text-5xl font-bold text-white">Our Mission</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            We believe every professional deserves a fair shot at their dream job.
                            Recruitment has become automated, so your application strategy should be too.
                        </p>
                        <p className="text-slate-400 text-lg leading-relaxed">
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
                        <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full" />
                        <div className="relative bg-neutral-900 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
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
                                        <div className="flex justify-between text-sm text-slate-300 mb-2">
                                            <span>{item.label}</span>
                                            <span className="text-blue-400">{item.progress}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
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
            <section className="relative z-10 py-24 px-6 bg-neutral-900/20 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">What Makes Us Different</h2>
                        <p className="text-slate-400 text-lg">Not just a resume builder. A full career engine.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                        {features.map((feature, idx) => (
                            <SpotlightCard
                                key={idx}
                                className={`${feature.colSpan} p-8 rounded-3xl bg-neutral-900 flex flex-col justify-between`}
                            >
                                <div>
                                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6 text-white">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">
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
                        <h2 className="text-3xl md:text-5xl font-bold text-white">Built for the Future of Work</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "Lightning Fast", desc: "Analysis in seconds, not days.", icon: Zap },
                            { title: "Data Driven", desc: "Insights from 10M+ job descriptions.", icon: Cpu },
                            { title: "Private & Secure", desc: "Your career data belongs to you.", icon: ShieldCheck }
                        ].map((item, i) => (
                            <SpotlightCard key={i} className="p-8 rounded-2xl bg-neutral-900/30 text-center">
                                <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-400">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-slate-400">{item.desc}</p>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. CTA Section */}
            <section className="relative z-10 py-20 px-6 pb-32">
                <div className="max-w-4xl mx-auto relative">
                    <div className="absolute inset-0 bg-blue-600/10 blur-[100px] rounded-full" />

                    <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-12 text-center overflow-hidden">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Ready to Upgrade Your Career?
                        </h2>
                        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
                            Join thousands of professionals who have already transformed their careers with Rezumix.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/login">
                                <button className="w-full sm:w-auto px-8 py-4 bg-white text-black text-lg font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer">
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