"use client"
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Mic,
    MicOff,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    Loader2,
    Video,
    VideoOff,
    ArrowLeft,
    Play,
    Pause,
    RotateCcw,
    Sparkles,
    MessageSquare,
    Camera
} from 'lucide-react';
import React from 'react';
import WebCam from "react-webcam";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useParams, useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { apiClient } from "@/lib/api-client";
import axios from "axios";

// 1. Reuse GridBackground (Blue/Purple Theme for Interview)
const GridBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-0 w-full h-[60vh] bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-full h-[60vh] bg-purple-600/5 blur-[120px] rounded-full mix-blend-screen" />
    </div>
);

const InterviewSection = ({ params }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { slug } = useParams();
    const id = slug;

    // State management
    const [interviewDetails, setInterviewDetails] = useState(null);
    const [geminiOutput, setGeminiOutput] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userAnswer, setUserAnswer] = useState('');
    const [checkingAnswer, setCheckingAnswer] = useState(false);
    const [answerFeedback, setAnswerFeedback] = useState(null);
    const [showAllQuestions, setShowAllQuestions] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [mediaError, setMediaError] = useState(null);

    const webcamRef = useRef(null);

    // Speech recognition
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 300);
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/");
        }
    }, [status, router]);

    // Fetch interview data
    useEffect(() => {
        const fetchInterviewById = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.getMockInterview(id)
                const data = response.data;
                setInterviewDetails(data);

                let questions = [];
                if (data.geminiResponse) {
                    if (Array.isArray(data.geminiResponse)) {
                        questions = data.geminiResponse;
                    } else {
                        questions = Object.values(data.geminiResponse);
                    }
                }
                setGeminiOutput(questions);
            } catch (error) {
                console.error("Error fetching interview:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchInterviewById();

        return () => {
            if (listening) SpeechRecognition.stopListening();
        };
    }, [id, listening]);

    useEffect(() => {
        setUserAnswer(transcript);
    }, [transcript]);

    const toggleWebcam = () => setIsVideoOn(!isVideoOn);

    const toggleSpeechRecognition = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true });
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < geminiOutput.length - 1) {
            resetTranscript();
            setUserAnswer('');
            setAnswerFeedback(null);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            resetTranscript();
            setUserAnswer('');
            setAnswerFeedback(null);
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleCheckAnswer = async () => {
        if (!userAnswer.trim()) {
            alert("Please provide an answer before checking.");
            return;
        }

        try {
            setCheckingAnswer(true);
            const question = geminiOutput[currentQuestionIndex].question;
            const response = await axios.post("/api/interview-answer", {
                userAnswer,
                question
            });

            const feedback = response.data.geminiResponse;
            setAnswerFeedback({
                overallFeedback: feedback.overallFeedback || "No feedback provided.",
                strengths: feedback.strengths || [],
                areasForImprovement: feedback.areasForImprovement || [],
                correctness: feedback.correctness || "Not specified",
                relevance: feedback.relevance || "Not specified",
                clarity: feedback.clarity || "Not specified"
            });
        } catch (error) {
            console.error("Error checking answer:", error);
            alert("Something went wrong while checking your answer.");
        } finally {
            setCheckingAnswer(false);
        }
    };

    const returnToInterviews = () => {
        const path = session?.user?.role === "admin" ? "/admindashboard" : "/my-interview";
        router.push(path);
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p>Preparing interview session...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
            <GridBackground />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

                {/* Top Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        onClick={returnToInterviews}
                        className="text-slate-400 hover:text-white hover:bg-white/5 gap-2 pl-0"
                    >
                        <ArrowLeft className="h-4 w-4" /> Exit Session
                    </Button>
                    {interviewDetails && (
                        <div className="text-right">
                            <h2 className="text-sm font-bold text-white">{interviewDetails.jobRole}</h2>
                            <p className="text-xs text-slate-500">{interviewDetails.experience} Years • {geminiOutput.length} Questions</p>
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className={`grid lg:grid-cols-2 gap-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                    {/* LEFT COLUMN: Camera & Answer Area */}
                    <div className="space-y-6">

                        {/* 1. Camera Feed Card */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 shadow-xl">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-blue-400" /> Video Feed
                                </h3>
                                {isVideoOn && <span className="text-xs text-red-400 flex items-center gap-1 animate-pulse">● Live</span>}
                            </div>

                            <div className="relative w-full aspect-video bg-[#111] rounded-xl overflow-hidden border border-white/5 mb-4 group">
                                {isVideoOn ? (
                                    <>
                                        <WebCam 
                                            ref={webcamRef} 
                                            className="w-full h-full object-cover transform scale-x-[-1]"
                                            onUserMediaError={(err) => setMediaError(err.message)}
                                            onUserMedia={() => setMediaError(null)}
                                        />
                                        {mediaError && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] gap-3 p-4">
                                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                                                    <VideoOff className="w-8 h-8 text-red-400" />
                                                </div>
                                                <p className="text-xs text-red-400 font-medium">Camera access denied</p>
                                                <p className="text-xs text-slate-500 text-center">
                                                    Please allow camera access in your browser settings and refresh the page.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-2">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                            <VideoOff className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="text-xs">Camera is turned off</p>
                                    </div>
                                )}
                            </div>

                            {!browserSupportsSpeechRecognition && (
                                <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
                                    <MicOff className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                    <p className="text-xs text-yellow-400">
                                        Speech recognition is not supported in your browser. Please use Chrome for the best experience.
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={toggleWebcam}
                                    className={`w-full ${isVideoOn ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-blue-600 hover:bg-blue-500 text-white"} border border-transparent`}
                                >
                                    {isVideoOn ? <><VideoOff className="w-4 h-4 mr-2" /> Stop Cam</> : <><Video className="w-4 h-4 mr-2" /> Start Cam</>}
                                </Button>
                                <Button
                                    onClick={toggleSpeechRecognition}
                                    disabled={!browserSupportsSpeechRecognition}
                                    className={`w-full ${listening ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-white text-black hover:bg-slate-200"} disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    {listening ? <><Pause className="w-4 h-4 mr-2" /> Stop Rec</> : <><Mic className="w-4 h-4 mr-2" /> Record</>}
                                </Button>
                            </div>
                        </div>

                        {/* 2. Answer Input Area */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-purple-400" /> Your Answer
                                </h3>
                                {listening && <span className="text-xs text-green-400 font-mono">Listening...</span>}
                            </div>

                            <div className="relative">
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Click 'Record' to speak or type your answer here..."
                                    className="w-full h-40 bg-[#111] border border-white/10 rounded-xl p-4 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none text-sm leading-relaxed"
                                />
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={resetTranscript}
                                    className="absolute bottom-3 right-3 text-slate-500 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                                    title="Clear"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Button
                                    onClick={handleCheckAnswer}
                                    disabled={checkingAnswer || !userAnswer.trim()}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-blue-900/20"
                                >
                                    {checkingAnswer ? (
                                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" /> Submit Answer</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Question & Feedback */}
                    <div className="space-y-6">

                        {/* 3. Question Card */}
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${((currentQuestionIndex + 1) / geminiOutput.length) * 100}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center mb-6 mt-2">
                                <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                                    Question {currentQuestionIndex + 1} of {geminiOutput.length}
                                </Badge>
                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={prevQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className="h-8 w-8 border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={nextQuestion}
                                        disabled={currentQuestionIndex === geminiOutput.length - 1}
                                        className="h-8 w-8 border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="min-h-[100px] flex items-center justify-center text-center">
                                <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                                    {geminiOutput[currentQuestionIndex]?.question || "Loading question..."}
                                </h2>
                            </div>

                            <div className="mt-6 flex justify-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-slate-500 hover:text-white"
                                    onClick={() => setShowAllQuestions(!showAllQuestions)}
                                >
                                    {showAllQuestions ? "Hide Question List" : "View All Questions"}
                                </Button>
                            </div>

                            {/* Question List Dropdown */}
                            {showAllQuestions && (
                                <div className="mt-4 p-4 bg-[#111] rounded-xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                                    {geminiOutput.map((q, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                setCurrentQuestionIndex(idx);
                                                setShowAllQuestions(false);
                                                setAnswerFeedback(null);
                                                setUserAnswer("");
                                            }}
                                            className={`p-2 text-sm cursor-pointer rounded-lg mb-1 truncate ${currentQuestionIndex === idx ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                                        >
                                            <span className="font-mono mr-2 text-xs opacity-50">Q{idx + 1}.</span>
                                            {q.question}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 4. Feedback Card */}
                        {answerFeedback && (
                            <div className="bg-[#0A0A0A] border border-green-500/20 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-white">AI Feedback</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4">
                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {answerFeedback.overallFeedback}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: "Correctness", val: answerFeedback.correctness },
                                            { label: "Clarity", val: answerFeedback.clarity },
                                            { label: "Relevance", val: answerFeedback.relevance }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-[#111] rounded-lg p-3 text-center border border-white/5">
                                                <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                                                <div className="text-sm font-bold text-white">{stat.val}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {answerFeedback.areasForImprovement?.length > 0 && (
                                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">To Improve</h4>
                                            <ul className="text-sm text-slate-400 space-y-1 list-disc pl-4">
                                                {answerFeedback.areasForImprovement.map((tip, idx) => (
                                                    <li key={idx}>{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InterviewSection;