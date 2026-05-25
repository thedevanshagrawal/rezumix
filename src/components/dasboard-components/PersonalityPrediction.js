"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, ArrowLeft, Brain, Star, Clock, Target, Sparkles, User, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { Button } from "../ui/button";
import { useThemeMode } from "@/hooks/use-theme-mode";
import ThemeToggle from "@/components/ThemeToggle";

const questions = [
    { id: 1, text: "Do you prefer structured routines?" },
    { id: 2, text: "Do you enjoy socializing in large groups?" },
    { id: 3, text: "Do you make decisions based on logic?" },
    { id: 4, text: "Do you enjoy working in a team?" },
    { id: 5, text: "Do you enjoy working independently?" },
    { id: 6, text: "Are you comfortable taking risks in decision-making?" },
    { id: 7, text: "Are you highly organized and detail-oriented?" },
    { id: 8, text: "Do you find it easy to empathize with others?" },
    { id: 9, text: "Do you enjoy learning new skills and concepts?" },
    { id: 10, text: "Do you prefer working under pressure?" },
    { id: 11, text: "Are you more of a leader in group settings?" },
    { id: 12, text: "Do you handle unexpected changes well?" },
    { id: 13, text: "Do you rely on data and facts when making decisions?" },
    { id: 14, text: "Do you prefer working on long-term projects?" },
    { id: 15, text: "Are you comfortable speaking in front of large audiences?" },
    { id: 16, text: "Do you often reflect on your thoughts and emotions?" },
    { id: 17, text: "Do you enjoy collaborating with others on complex problems?" },
    { id: 18, text: "Do you prefer a fast-paced work environment?" },
    { id: 19, text: "Are you more motivated by personal growth?" },
    { id: 20, text: "Do you find it easy to adapt to new situations?" },
];

const options = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"];

// Background Component
const GridBackground = ({ isLight }) => (
        <div className={`fixed inset-0 z-0 pointer-events-none ${isLight ? "bg-[#f8fafc]" : "bg-[#050505]"}`}>
                <div className={`absolute inset-0 ${isLight
                        ? "bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)]"
                        : "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"
                        } bg-[size:32px_32px]`} />
                <div className={`absolute top-0 left-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-purple-400/10" : "bg-purple-600/5"}`} />
                <div className={`absolute bottom-0 right-0 w-full h-[60vh] blur-[120px] rounded-full ${isLight ? "bg-pink-300/10" : "bg-pink-600/5"}`} />
        </div>
);

export default function PersonalityPrediction() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { isLight } = useThemeMode();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [personalityResult, setPersonalityResult] = useState('');
    const [name, setName] = useState("");
    const [quizStarted, setQuizStarted] = useState(false);

    const handleAnswer = (value) => {
        setAnswers({ ...answers, [questions[currentQuestion].text]: value });
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            submitAnswers();
        }
    };

    const submitAnswers = async () => {
        setSubmitted(true);
        try {
            const response = await fetch(`/api/personality-prediction`, {
                method: "POST",
                body: JSON.stringify({ answers, name })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = JSON.parse(line.slice(6));
                        setPersonalityResult((prev) => prev + data.content);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching AI analysis:", error);
            setPersonalityResult("Failed to analyze personality.");
        }
    };

    const progressPercentage = (currentQuestion / questions.length) * 100;

    const startQuiz = () => {
        if (name.trim() !== "") setQuizStarted(true);
    };

    const retakeQuiz = () => {
        setSubmitted(false);
        setCurrentQuestion(0);
        setAnswers({});
        setPersonalityResult('');
        setQuizStarted(false);
        setName("");
    };

    const renderMarkdown = (markdown) => {
        if (!markdown) return { __html: '' };
        marked.setOptions({ breaks: true, gfm: true });
        return { __html: marked(markdown) };
    };

    if (status === "loading") return null;

    return (
        <div className={`relative min-h-screen font-sans overflow-x-hidden ${isLight ? "bg-[#f8fafc] text-slate-900 selection:bg-purple-500/20" : "bg-[#050505] text-slate-200 selection:bg-purple-500/30"}`}>
            <GridBackground isLight={isLight} />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                <div className="flex justify-end mb-6">
                    <ThemeToggle />
                </div>
                
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
                        <Brain className="w-3 h-3" />
                        <span>Psychometric AI</span>
                    </div>
                    <h1 className={`text-3xl md:text-5xl font-bold mb-6 tracking-tight ${isLight ? "text-slate-950" : "text-white"}`}>
                        Personality <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Assessment</span>
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                        Discover your professional archetype. We analyze 20 data points to find the work environment where you&apos;ll thrive.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!quizStarted ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`max-w-2xl mx-auto relative rounded-3xl p-8 md:p-12 shadow-2xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-white/10"}`}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-6 text-purple-400">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h2 className={`text-2xl font-bold mb-4 ${isLight ? "text-slate-950" : "text-white"}`}>Ready to begin?</h2>
                                <div className="max-w-xs mx-auto space-y-6">
                                    <div className="space-y-2 text-left">
                                        <label className={`text-sm font-medium ml-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>Your Full Name</label>
                                        <div className="relative">
                                            <User className={`absolute left-4 top-3.5 w-5 h-5 ${isLight ? "text-slate-400" : "text-slate-500"}`} />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                                className={`w-full rounded-xl py-3 pl-12 pr-4 focus:outline-none transition-all ${isLight ? "bg-white border border-slate-200 text-slate-900 focus:border-purple-500/50" : "bg-[#111] border border-white/10 text-white focus:border-purple-500/50"}`}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={startQuiz}
                                        disabled={!name}
                                        className={`w-full py-6 font-bold rounded-xl transition-all text-base cursor-pointer ${isLight ? "bg-slate-950 text-white hover:bg-slate-800 shadow-[0_0_20px_-5px_rgba(15,23,42,0.25)]" : "bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"}`}
                                    >
                                        Start Assessment <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : !submitted ? (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className={`max-w-3xl mx-auto relative rounded-3xl p-8 md:p-12 shadow-2xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-white/10"}`}
                        >
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className={`flex justify-between text-xs mb-2 font-mono ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                                    <span>QUESTION {currentQuestion + 1} / {questions.length}</span>
                                    <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className={`h-1 rounded-full overflow-hidden ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            <h2 className={`text-2xl md:text-3xl font-bold mb-10 text-center leading-snug ${isLight ? "text-slate-950" : "text-white"}`}>
                                {questions[currentQuestion].text}
                            </h2>

                            <div className="space-y-3">
                                {options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        className={`w-full p-4 text-left rounded-xl transition-all duration-200 flex items-center justify-between group ${isLight ? "bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-purple-400/30" : "bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30"}`}
                                    >
                                        <span className={`font-medium ${isLight ? "text-slate-700 group-hover:text-slate-950" : "text-slate-300 group-hover:text-white"}`}>{option}</span>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isLight ? "border-slate-300 group-hover:border-purple-400" : "border-slate-600 group-hover:border-purple-400"}`}>
                                            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative rounded-3xl p-8 md:p-12 shadow-2xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-white/10"}`}
                        >
                            <div className={`flex items-center gap-4 mb-8 pb-6 ${isLight ? "border-b border-slate-200" : "border-b border-white/5"}`}>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className={`text-2xl font-bold ${isLight ? "text-slate-950" : "text-white"}`}>Personality Profile</h2>
                                    <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>Analysis for {name}</p>
                                </div>
                            </div>

                            {personalityResult ? (
                                <div 
                                    className={`
                                        leading-relaxed space-y-6
                                        [&>h1]:text-purple-400 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-6
                                        [&>h2]:text-purple-600 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4
                                        [&>h3]:text-purple-600 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3
                                        [&>h4]:text-purple-500 [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mt-5 [&>h4]:mb-3
                                        [&>p]:leading-7 [&>p]:mb-5
                                        [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-3 [&>ul]:list-disc
                                        [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:space-y-3
                                        [&>li]:mb-2 [&>li]:leading-7 [&>li]:marker:text-purple-500
                                        [&>strong]:font-semibold
                                        [&>blockquote]:border-l-4 [&>blockquote]:border-purple-500 [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:rounded-r-xl [&>blockquote]:my-8 [&>blockquote]:italic
                                        ${isLight ? "[&>blockquote]:bg-purple-50 [&>blockquote]:text-slate-700" : "[&>blockquote]:bg-white/5 [&>blockquote]:text-slate-200"}
                                        [&>hr]:border-slate-200 [&>hr]:my-8
                                    `}
                                    dangerouslySetInnerHTML={renderMarkdown(personalityResult)} 
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                    <p className="text-purple-300 text-lg animate-pulse">Analyzing your traits...</p>
                                </div>
                            )}

                            {personalityResult && (
                                <div className={`mt-12 pt-8 ${isLight ? "border-t border-slate-200" : "border-t border-white/10"}`}>
                                    <button
                                        onClick={retakeQuiz}
                                        className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer ${isLight ? "bg-white hover:bg-slate-50 border border-slate-200 text-slate-950" : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"}`}
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Retake Assessment
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}