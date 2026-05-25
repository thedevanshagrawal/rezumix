"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Briefcase,
    Target,
    Code,
    Search,
    Calendar,
    Trophy,
    Play,
    ArrowRight,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useThemeMode } from "@/hooks/use-theme-mode";
import ThemeToggle from "@/components/ThemeToggle";

// 1. Grid Background
const GridBackground = ({ isLight }) => (
    <div className={`fixed inset-0 z-0 pointer-events-none ${isLight ? "bg-[#f8fafc]" : "bg-[#050505]"}`}>
        <div className={`absolute inset-0 ${isLight
            ? "bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"
        } bg-[size:32px_32px]`} />
        <div className={`absolute top-0 left-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-violet-400/10" : "bg-violet-600/5"}`} />
        <div className={`absolute bottom-0 right-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-fuchsia-300/10" : "bg-fuchsia-600/5"}`} />
    </div>
);

// 2. Spotlight Card for Interviews
function SpotlightCard({ children, className = "", isLight }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`relative overflow-hidden group ${isLight ? "border border-slate-200 bg-white" : "border border-white/10 bg-[#0A0A0A]"} ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full z-10">{children}</div>
        </div>
    );
}

const MyInterview = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { isLight } = useThemeMode();

    const [interviewDetails, setInterviewDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredInterviews = useMemo(() => {
        return interviewDetails.filter((interview) => {
            return interview.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
                interview.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                interview.techStack.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [interviewDetails, searchQuery]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchInterview = async () => {
            try {
                const userEmail = session?.user?.email;
                if (!userEmail) return;
                setIsLoading(true);
                const response = await apiClient.getMockInterviewDetails(userEmail);
                if (response.data?.data) {
                    setInterviewDetails(response.data.data);
                } else if (response.data && Array.isArray(response.data)) {
                    setInterviewDetails(response.data);
                } else {
                    setInterviewDetails([]);
                }
            } catch (error) {
                console.error("Failed to fetch interviews:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (status === "authenticated" && session?.user?.email) {
            fetchInterview();
        }
    }, [session, status]);

    if (status === "loading" || isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isLight ? "bg-[#f8fafc]" : "bg-[#050505]"}`}>
                <div className="text-slate-500">Loading interviews...</div>
            </div>
        );
    }

    return (
        <div className={`relative min-h-screen font-sans overflow-x-hidden ${isLight ? "bg-[#f8fafc] text-slate-900 selection:bg-violet-500/20" : "bg-[#050505] text-slate-200 selection:bg-violet-500/30"}`}>
            <GridBackground isLight={isLight} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <div className="flex justify-end mb-6">
                    <ThemeToggle />
                </div>

                {/* Header */}
                <div className="mb-12">
                    <h1 className={`text-3xl md:text-5xl font-bold mb-6 ${isLight ? "text-slate-950" : "text-white"}`}>
                        Your Mock Interviews
                    </h1>

                    {/* Search Bar */}
                    <div className="relative max-w-xl">
                        <Search className={`absolute left-4 top-3.5 w-5 h-5 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                        <Input
                            type="text"
                            placeholder="Search by role or tech stack..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`pl-12 h-12 rounded-xl w-full ${isLight ? "bg-white border-slate-200 text-slate-900 focus:border-violet-500/50" : "bg-[#0A0A0A] border-white/10 text-white focus:border-violet-500/50"}`}
                        />
                    </div>
                </div>

                {/* Content Grid */}
                {filteredInterviews.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-20 rounded-3xl ${isLight ? "border border-dashed border-slate-200 bg-white" : "border border-dashed border-white/10 bg-white/[0.02]"}`}>
                        <BookOpen className={`w-16 h-16 mb-4 ${isLight ? "text-slate-400" : "text-slate-700"}`} />
                        <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-slate-950" : "text-white"}`}>No Interviews Found</h3>
                        <p className={`${isLight ? "text-slate-500" : "text-slate-400"} mb-6`}>Create a new session to get started.</p>
                        <Link href="/mock-interview">
                            <Button className={`rounded-xl px-6 cursor-pointer ${isLight ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-white text-black hover:bg-slate-200"}`}>
                                Create New
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInterviews.map((details, index) => (
                            <SpotlightCard key={details._id || index} isLight={isLight} className="rounded-2xl p-6 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20">
                                            <Briefcase className="w-6 h-6 text-violet-400" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold leading-tight line-clamp-1 ${isLight ? "text-slate-950" : "text-white"}`}>
                                                {details.jobRole}
                                            </h3>
                                            <div className={`flex items-center gap-1 text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                                <Calendar className="w-3 h-3" />
                                                {new Date(details.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-grow mb-6">
                                    <div>
                                        <div className={`text-xs font-medium uppercase mb-1 flex items-center gap-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                            <Target className="w-3 h-3" /> Description
                                        </div>
                                        <p className={`text-sm line-clamp-2 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                                            {details.jobDescription}
                                        </p>
                                    </div>

                                    <div>
                                        <div className={`text-xs font-medium uppercase mb-2 flex items-center gap-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                            <Code className="w-3 h-3" /> Stack
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {details.techStack.split(",").slice(0, 3).map((tech, i) => (
                                                <span key={i} className={`px-2 py-1 rounded-md text-xs ${isLight ? "bg-slate-100 border border-slate-200 text-slate-700" : "bg-white/5 border border-white/5 text-slate-300"}`}>
                                                    {tech.trim()}
                                                </span>
                                            ))}
                                            {details.techStack.split(",").length > 3 && (
                                                <span className={`px-2 py-1 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                                    +{details.techStack.split(",").length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/interview/${details._id}`} className="w-full mt-auto">
                                    <Button className={`w-full rounded-xl py-6 border-0 cursor-pointer ${isLight ? "bg-slate-950 hover:bg-slate-800 text-white shadow-[0_0_20px_-5px_rgba(15,23,42,0.25)]" : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20"}`}>
                                        <Play className="w-4 h-4 mr-2 fill-current" /> Start Practice
                                    </Button>
                                </Link>
                            </SpotlightCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyInterview;