"use client"
import React, { useEffect, useState } from 'react'
import { FileText, Briefcase, User, Video, BrainCircuit } from 'lucide-react'
import Link from 'next/link'
import { useThemeMode } from '@/hooks/use-theme-mode'

const DashboardUI = () => {
    const [activeFeature, setActiveFeature] = useState(0);
    const { isLight } = useThemeMode();

    // Auto-rotate features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 5);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            title: "Resume Analyzer",
            href: "/resume-analyzer",
            icon: <FileText className="w-6 h-6 text-emerald-400" />,
            description: "AI-powered feedback to improve your chances of landing interviews with ATS compatibility checks.",
            color: "text-emerald-400",
            borderColor: "border-emerald-500/20",
            gradient: "from-emerald-500/10 to-transparent",
            stats: "50k+ Analyzed"
        },
        {
            title: "Career Path",
            href: "/recommend-career",
            icon: <Briefcase className="w-6 h-6 text-amber-400" />,
            description: "Personalized career suggestions based on your skills, interests, and current industry trends.",
            color: "text-amber-400",
            borderColor: "border-amber-500/20",
            gradient: "from-amber-500/10 to-transparent",
            stats: "10k+ Guided"
        },
        {
            title: "Personality Fit",
            href: "/personality-prediction",
            icon: <User className="w-6 h-6 text-purple-400" />,
            description: "Discover your professional personality type and find careers that align with your natural strengths.",
            color: "text-purple-400",
            borderColor: "border-purple-500/20",
            gradient: "from-purple-500/10 to-transparent",
            stats: "4.9★ Rating"
        },
        {
            title: "Mock Interview",
            href: "/mock-interview",
            icon: <Video className="w-6 h-6 text-indigo-400" />,
            description: "Practice with our AI interviewer and get real-time feedback on your responses and clarity.",
            color: "text-indigo-400",
            borderColor: "border-indigo-500/20",
            gradient: "from-indigo-500/10 to-transparent",
            stats: "95% Success"
        },
        {
            title: "Skill Gap",
            href: "/skill-gap",
            icon: <BrainCircuit className="w-6 h-6 text-cyan-400" />,
            description: "Find the exact skills missing for your dream job and get a roadmap to learn them.",
            color: "text-cyan-400",
            borderColor: "border-cyan-500/20",
            gradient: "from-cyan-500/10 to-transparent",
            stats: "New Feature"
        },
    ];

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-10 text-center md:text-left">
                <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isLight ? "text-slate-950" : "text-white"}`}>
                    Your Career Intelligence Hub
                </h2>
                <p className={`max-w-2xl ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                    Select a tool below to optimize your professional profile.
                </p>

                {/* Quick Stats Strip */}
                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${isLight ? "bg-white border-slate-200 text-slate-600" : "bg-white/5 border-white/5 text-slate-300"}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                        AI System Online
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${isLight ? "bg-white border-slate-200 text-slate-600" : "bg-white/5 border-white/5 text-slate-300"}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                        All Tools Unlocked
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <Link
                        key={index}
                        href={feature.href}
                        onMouseEnter={() => setActiveFeature(index)}
                        className={`relative group p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer
                            ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0A0A0A] border-white/5"}
                            ${activeFeature === index ? feature.borderColor : isLight ? 'border-slate-200' : 'border-white/5'}
                        `}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl border transition-colors ${isLight ? "bg-slate-100 border-slate-200 group-hover:bg-slate-200" : "bg-white/5 border-white/5 group-hover:bg-white/10"}`}>
                                    {feature.icon}
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/5"} ${feature.color}`}>
                                    {feature.stats}
                                </span>
                            </div>

                            <h3 className={`text-lg font-bold mb-2 ${isLight ? "text-slate-950" : "text-white"}`}>{feature.title}</h3>
                            <p className={`text-sm mb-6 flex-grow leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                                {feature.description}
                            </p>

                            {/* Active Indicator Line */}
                            <div className={`h-1 w-full rounded-full overflow-hidden ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                                <div
                                    className={`h-full ${feature.color.replace('text-', 'bg-')} transition-all duration-500 ease-out`}
                                    style={{ width: activeFeature === index ? '100%' : '0%' }}
                                />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default DashboardUI