"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight,
    ArrowLeft,
    Brain,
    Target,
    Sparkles,
    User,
    ArrowRight
} from "lucide-react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { marked } from "marked";

import { FetchErrorBanner } from "@/components/ui/fetch-error-banner";

/* ---------------- BACKGROUND ---------------- */
const GridBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-pink-600/5 blur-[120px] rounded-full mix-blend-screen" />
    </div>
);

/* ---------------- QUESTIONS ---------------- */
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

const options = [
    "Strongly Agree",
    "Agree",
    "Neutral",
    "Disagree",
    "Strongly Disagree",
];

marked.setOptions({
    breaks: true,
    gfm: true,
});

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
    const [personalityResult, setPersonalityResult] = useState("");
    const [fetchError, setFetchError] = useState("");
    const [name, setName] = useState("");
    const [quizStarted, setQuizStarted] = useState(false);
    const [loading, setLoading] = useState(false);

    /* ---------------- COPY FUNCTION ---------------- */
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
        } catch (err) {
            console.log("Copy failed:", err);
        }
    };

    /* ---------------- HANDLERS ---------------- */
    const handleAnswer = (value) => {
        const updatedAnswers = {
            ...answers,
            [questions[currentQuestion].text]: value,
        };
        setAnswers(updatedAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            submitAnswers(updatedAnswers);
        }
    };

    const submitAnswers = async (finalAnswers) => {
        setSubmitted(true);
        setLoading(true);
        setFetchError("");

        try {
            // Correct API route based on the maintainer's codebase screenshot
            const response = await fetch("/api/personality-prediction", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ answers: finalAnswers, name }),
            });

            // Read as text first to prevent the "<" unexpected token crash
            const textResponse = await response.text();

            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (jsonError) {
                console.error("Server returned HTML instead of JSON:", textResponse);
                throw new Error("Server Error: The backend crashed. Check the Gemini API Key or the route.js file.");
            }

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong on the server");
            }

            // Adjust to data.content or data.result depending on what route.js actually returns
            setPersonalityResult(data.result || data.content || "");
        } catch (error) {
            console.error(error);
            setFetchError(error.message || "Failed to analyze personality.");
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = () => {
        if (name.trim() !== "") {
            setQuizStarted(true);
        }
    };

    const retakeQuiz = () => {
        setSubmitted(false);
        setCurrentQuestion(0);
        setAnswers({});
        setPersonalityResult("");
        setFetchError("");
        setQuizStarted(false);
        setName("");
    };

    const renderMarkdown = (markdown) => {
        if (!markdown) {
            return { __html: "" };
        }
        return {
            __html: marked(markdown),
        };
    };

    const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

    if (status === "loading") return null;

    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-200 overflow-x-hidden">
            <GridBackground />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* ORIGINAL HEADER & TAGLINE */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
                        <Brain className="w-3 h-3" />
                        <span>Psychometric AI</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Personality{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Assessment
                        </span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Discover your professional archetype with AI.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {/* START SCREEN */}
                    {!quizStarted ? (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-2xl mx-auto"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center mb-6 text-purple-400">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Ready to begin?
                                </h2>
                                <div className="max-w-xs mx-auto space-y-6">
                                    <div className="space-y-2 text-left">
                                        <label className="text-sm font-medium text-slate-400 ml-1">
                                            Your Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                placeholder="Enter your name"
                                                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={startQuiz}
                                        disabled={!name}
                                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            Start Assessment <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : !submitted ? (
                        /* QUIZ SCREEN */
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl max-w-3xl mx-auto"
                        >
                            {/* PROGRESS */}
                            <div className="mb-8">
                                <div className="flex justify-between text-xs text-slate-400 mb-2">
                                    <span>
                                        QUESTION {currentQuestion + 1} /{" "}
                                        {questions.length}
                                    </span>
                                    <span>
                                        {Math.round(progressPercentage)}%
                                    </span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                        animate={{
                                            width: `${progressPercentage}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">
                                {questions[currentQuestion].text}
                            </h2>

                            <div className="space-y-3">
                                {options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        className="w-full p-4 text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-300 font-medium">
                                                {option}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-slate-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        /* RESULTS SCREEN */
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                        >
                            <div className="flex items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                        <Target className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Personality Profile
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                            Analysis for {name}
                                        </p>
                                    </div>
                                </div>
                                {personalityResult && (
                                    <button
                                        onClick={() =>
                                            copyToClipboard(personalityResult)
                                        }
                                        className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white"
                                    >
                                        Copy Result
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                                    <p className="text-purple-300 text-lg">
                                        Analyzing your traits...
                                    </p>
                                </div>
                            ) : fetchError ? (
                                <FetchErrorBanner message={fetchError} />
                            ) : (
                                <div
                                    className="prose prose-invert max-w-none text-slate-300"
                                    dangerouslySetInnerHTML={renderMarkdown(
                                        personalityResult
                                    )}
                                />
                            )}

                            {!loading && (
                                <div className="mt-12 pt-8 border-t border-white/10">
                                    <button
                                        onClick={retakeQuiz}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Retake
                                        Assessment
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
