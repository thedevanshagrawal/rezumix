"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, ArrowLeft, Brain, Star, Clock, Target, Sparkles, User, ArrowRight, Download, Loader2 } from "lucide-react";
import { exportPersonalityPDF } from "@/lib/exportPersonalityPDF";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { Button } from "../ui/button";
import { FetchErrorBanner } from "@/components/ui/fetch-error-banner";

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
const GridBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
    <div className="absolute top-0 left-0 w-full h-[60vh] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
    <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-pink-600/5 blur-[120px] rounded-full mix-blend-screen" />
  </div>
);

export default function PersonalityPrediction() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [personalityResult, setPersonalityResult] = useState('');
    const [fetchError, setFetchError] = useState("");
    const [isExporting, setIsExporting] = useState(false);
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

            if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);

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
            setFetchError(error.message || "Failed to analyze personality. Please try again.");
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
        setFetchError("");
        setQuizStarted(false);
        setName("");
    };

    // Generates and downloads the personality report as a PDF
    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            await exportPersonalityPDF(personalityResult, name);
        } catch (error) {
            console.error("PDF export failed:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const renderMarkdown = (markdown) => {
        if (!markdown) return { __html: '' };
        marked.setOptions({ breaks: true, gfm: true });
        return { __html: marked(markdown) };
    };

    if (status === "loading") return null;

    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden">
            <GridBackground />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
                        <Brain className="w-3 h-3" />
                        <span>Psychometric AI</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Personality <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Assessment</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
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
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl mx-auto relative"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-6 text-purple-400">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">Ready to begin?</h2>
                                <div className="max-w-xs mx-auto space-y-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Your Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        onClick={startQuiz}
                                        disabled={!name}
                                        className="w-full py-6 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all text-base shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] cursor-pointer"
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
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-3xl mx-auto relative"
                        >
                            {/* Progress Bar */}
                            <div className="mb-8">
                                <div className="flex justify-between text-xs text-slate-400 mb-2 font-mono">
                                    <span>QUESTION {currentQuestion + 1} / {questions.length}</span>
                                    <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center leading-snug">
                                {questions[currentQuestion].text}
                            </h2>

                            <div className="space-y-3">
                                {options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        className="w-full p-4 text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all duration-200 flex items-center justify-between group"
                                    >
                                        <span className="text-slate-300 group-hover:text-white font-medium">{option}</span>
                                        <div className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-purple-400 flex items-center justify-center">
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
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative"
                        >
                            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <Target className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Personality Profile</h2>
                                    <p className="text-slate-400 text-sm">Analysis for {name}</p>
                                </div>
                            </div>

                            {fetchError ? (
                                <FetchErrorBanner
                                    message={fetchError}
                                    onRetry={() => {
                                        setFetchError("");
                                        setPersonalityResult("");
                                        submitAnswers();
                                    }}
                                    className="my-8"
                                />
                            ) : personalityResult ? (
                                <div 
                                    className="
                                        text-slate-300 leading-relaxed space-y-6
                                        [&>h1]:text-purple-400 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-6
                                        [&>h2]:text-purple-400 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4
                                        [&>h3]:text-purple-400 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3
                                        [&>h4]:text-purple-300 [&>h4]:text-lg [&>h4]:font-medium [&>h4]:mt-5 [&>h4]:mb-3
                                        [&>p]:text-slate-300 [&>p]:leading-7 [&>p]:mb-5
                                        [&>ul]:text-slate-300 [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-3 [&>ul]:list-disc
                                        [&>ol]:text-slate-300 [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:space-y-3
                                        [&>li]:mb-2 [&>li]:leading-7 [&>li]:marker:text-purple-500
                                        [&>strong]:text-white [&>strong]:font-semibold
                                        [&>blockquote]:bg-white/5 [&>blockquote]:border-l-4 [&>blockquote]:border-purple-500 [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:rounded-r-xl [&>blockquote]:my-8 [&>blockquote]:italic
                                        [&>hr]:border-white/10 [&>hr]:my-8
                                    "
                                    dangerouslySetInnerHTML={renderMarkdown(personalityResult)} 
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                    <p className="text-purple-300 text-lg animate-pulse">Analyzing your traits...</p>
                                </div>
                            )}


                            {personalityResult && (
                                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <button
                                        onClick={retakeQuiz}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Retake Assessment
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isExporting}
                                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed border border-purple-500/30 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {isExporting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
                                        ) : (
                                            <><Download className="w-4 h-4" /> Download PDF Report</>
                                        )}
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