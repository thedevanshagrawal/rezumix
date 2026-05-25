"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Briefcase, User, Clock, ArrowRight, Target, Zap, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import { useThemeMode } from "@/hooks/use-theme-mode";
import ThemeToggle from "@/components/ThemeToggle";

// Reuse GridBackground
const GridBackground = ({ isLight }) => (
    <div className={`fixed inset-0 z-0 pointer-events-none ${isLight ? "bg-[#f8fafc]" : "bg-[#050505]"}`}>
        <div className={`absolute inset-0 ${isLight
            ? "bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"
        } bg-[size:32px_32px]`} />
        <div className={`absolute top-0 left-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-indigo-400/10" : "bg-indigo-600/5"}`} />
        <div className={`absolute bottom-0 right-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-purple-300/10" : "bg-purple-600/5"}`} />
    </div>
);

export default function MockInterview({ onCreateSuccess }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { isLight } = useThemeMode();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    const [formData, setFormData] = useState({
        jobRole: "",
        jobDescription: "",
        experience: "",
        techStack: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userEmail = session?.user?.email;
            const response = await apiClient.createMockInterview(formData, userEmail);

            if (response.status === 200) {
                setFormData({
                    jobRole: "",
                    jobDescription: "",
                    experience: "",
                    techStack: "",
                });

                if (onCreateSuccess) {
                    onCreateSuccess();
                } else {
                    router.push("/my-interview");
                }
            }
        } catch (error) {
            console.log("Error creating mock interview:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return null;

    return (
        <div className={`relative min-h-screen font-sans overflow-x-hidden ${isLight ? "bg-[#f8fafc] text-slate-900 selection:bg-indigo-500/20" : "bg-[#050505] text-slate-200 selection:bg-indigo-500/30"}`}>
            <GridBackground isLight={isLight} />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                <div className="flex justify-end mb-6">
                    <ThemeToggle />
                </div>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
                        <Video className="w-3 h-3" />
                        <span>AI Interview Simulator</span>
                    </div>
                    <h1 className={`text-3xl md:text-5xl font-bold mb-6 tracking-tight ${isLight ? "text-slate-950" : "text-white"}`}>
                        Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Interview Session</span>
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        Tell us about your target role so we can generate realistic interview questions and provide real-time feedback.
                    </p>
                </div>

                {/* Main Card */}
                <div className={`rounded-3xl p-8 md:p-12 shadow-2xl relative ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-white/10"}`}>
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className={`font-medium flex items-center gap-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                                    <Briefcase className="w-4 h-4 text-indigo-400" /> Job Role / Position
                                </Label>
                                <Input
                                    required
                                    name="jobRole"
                                    placeholder="e.g. Full Stack Developer"
                                    value={formData.jobRole}
                                    onChange={handleChange}
                                    className={`h-12 rounded-xl ${isLight ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500/50 focus:ring-indigo-500/20" : "bg-[#111] border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"}`}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className={`font-medium flex items-center gap-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                                    <Clock className="w-4 h-4 text-indigo-400" /> Years of Experience
                                </Label>
                                <Input
                                    required
                                    name="experience"
                                    placeholder="e.g. 2-3 years"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className={`h-12 rounded-xl ${isLight ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500/50 focus:ring-indigo-500/20" : "bg-[#111] border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"}`}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className={`font-medium flex items-center gap-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                                    <Target className="w-4 h-4 text-indigo-400" /> Job Description
                                </Label>
                                <Input
                                    required
                                    name="jobDescription"
                                    placeholder="Brief description of the role"
                                    value={formData.jobDescription}
                                    onChange={handleChange}
                                    className={`h-12 rounded-xl ${isLight ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500/50 focus:ring-indigo-500/20" : "bg-[#111] border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"}`}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className={`font-medium flex items-center gap-2 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                                    <Zap className="w-4 h-4 text-indigo-400" /> Technical Skills
                                </Label>
                                <Input
                                    required
                                    name="techStack"
                                    placeholder="e.g. React, Node.js, AWS"
                                    value={formData.techStack}
                                    onChange={handleChange}
                                    className={`h-12 rounded-xl ${isLight ? "bg-white border-slate-200 text-slate-900 focus:border-indigo-500/50 focus:ring-indigo-500/20" : "bg-[#111] border-white/10 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"}`}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-6 mt-4 text-base font-bold rounded-xl transition-all cursor-pointer ${isLight ? "bg-slate-950 text-white hover:bg-slate-800 shadow-[0_0_20px_-5px_rgba(15,23,42,0.25)]" : "bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"}`}
                        >
                            {loading ? (
                                <>Setting up Interview...</>
                            ) : (
                                <>Create Mock Interview <ArrowRight className="w-5 h-5 ml-2" /></>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}