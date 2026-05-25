"use client";
import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, ArrowRight, Zap, Target, TrendingUp, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import KeywordAnalysis from "@/components/dasboard-components/KeywordAnalysis";

export default function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState("");
    const [keywordData, setKeywordData] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({ hero: false, upload: false, results: false });

    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return
        if (!session || status === "unauthenticated") router.push("/");
    }, [session, status, router]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setTimeout(() => setIsVisible({ hero: true, upload: true, results: false }), 300);
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const name = selectedFile.name.toLowerCase();
        if (name.endsWith(".docx") || name.endsWith(".pdf")) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setError("");
        } else {
            setFile(null);
            setFileName("");
            setError("Please upload a .docx or .pdf file");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError("Please select a file to upload");

        setLoading(true);
        setResult("");
        setError("");
        setKeywordData(null);

        try {
            const userEmail = session?.user?.email;
            const isPDF = file.name.toLowerCase().endsWith(".pdf");
            let response;

            if (isPDF) {
                const { extractTextFromPDF } = await import("@/utils/extractPdfText");
                let text;
                try {
                    text = await extractTextFromPDF(file);
                } catch (pdfErr) {
                    console.error("PDF extraction failed:", pdfErr);
                    setError("PDF text extraction failed: " + pdfErr.message);
                    setLoading(false);
                    return;
                }

                if (!text || text.trim().length === 0) {
                    setError("Could not extract text from PDF. Make sure it's not a scanned image.");
                    setLoading(false);
                    return;
                }

                response = await fetch(`/api/analyze-resume?email=${encodeURIComponent(userEmail)}&fileType=pdf`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text })
                });

            } else {
                const formData = new FormData();
                formData.append("file", file);

                response = await fetch(`/api/analyze-resume?email=${encodeURIComponent(userEmail)}&fileType=docx`, {
                    method: "POST",
                    body: formData
                });
            }

            if (!response.ok) {
                const errData = await response.json();
                console.error("API error:", errData);
                setError("Server error: " + (errData.error || errData.details || "Unknown error"));
                setLoading(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            setIsVisible((prev) => ({ ...prev, results: true }));

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content !== undefined) {
                                setResult((prev) => prev + data.content);
                            } else if (data.keyword_data !== undefined) {
                                setKeywordData(data.keyword_data);
                            }
                        } catch (e) { console.error("Parse error:", e); }
                    }
                }
            }

        } catch (err) {
            console.error("Full error:", err);
            setError("Failed to analyze resume: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderMarkdown = (markdown) => {
        if (!markdown) return { __html: '' };
        marked.setOptions({ breaks: true, gfm: true });
        return { __html: marked(markdown) };
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-emerald-500/30">
            {/* Background */}
            <div className="inset-0 z-0 fixed pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]" style={{ transform: `translateY(${scrollY * 0.1}px)` }}></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-600/10 rounded-full blur-[100px]" style={{ transform: `translateY(${-scrollY * 0.1}px)` }}></div>
            </div>

            <div className="relative z-10">
                <section className="px-4 sm:px-6 lg:px-8 py-12">
                    <div className="max-w-5xl mx-auto">
                        <div className={`transition-all duration-1000 ease-out ${isVisible.upload ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            <div className="relative p-8 bg-[#0A0A0A] border border-emerald-500/20 rounded-3xl shadow-2xl">

                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold mb-2">Resume Audit</h2>
                                    <p className="text-gray-400">Upload your resume for instant AI scoring and feedback</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {!file ? (
                                        <div className="relative group cursor-pointer">
                                            <input type="file" accept=".docx,.pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                                            <div className="border-2 border-dashed border-gray-700 rounded-2xl h-64 flex flex-col items-center justify-center transition-all group-hover:border-emerald-500 group-hover:bg-emerald-500/5">
                                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-emerald-500 group-hover:scale-110 transition-transform">
                                                    <UploadCloud size={32} />
                                                </div>
                                                <h3 className="text-xl font-semibold text-white mb-2">Drop your resume here</h3>
                                                <p className="text-gray-500">Supports .docx and .pdf files</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-[#111] border border-gray-700 rounded-xl p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-white text-lg font-medium">{fileName}</p>
                                                    <p className="text-sm text-emerald-400 flex items-center gap-2 mt-1">
                                                        <CheckCircle className="w-4 h-4" /> Ready for scan
                                                    </p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => { setFile(null); setFileName(""); setResult(""); setKeywordData(null); }} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                                                <X size={24} />
                                            </button>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-400">
                                            <AlertCircle size={20} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            disabled={!file || loading}
                                            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-emerald-900/20 cursor-pointer"
                                        >
                                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <>Run Analysis <ArrowRight className="w-5 h-5" /></>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Analysis Results */}
                {result && (
                    <section className="px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="max-w-5xl mx-auto">
                            <div className={`transition-all duration-1000 ease-out ${isVisible.results ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <div className="relative p-8 bg-[#0A0A0A] border border-emerald-500/20 rounded-3xl shadow-2xl">

                                    <div className="flex items-center gap-4 mb-8 border-b border-gray-800 pb-6">
                                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
                                            <p className="text-gray-400 text-sm">Actionable feedback for improvement</p>
                                        </div>
                                    </div>

                                    <div
                                        dangerouslySetInnerHTML={renderMarkdown(result)}
                                        className="
                                            text-gray-300 text-lg leading-loose
                                            [&>h1]:text-emerald-400 [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mt-10 [&>h1]:mb-6
                                            [&>h2]:text-white [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-5 [&>h2]:border-l-4 [&>h2]:border-emerald-500 [&>h2]:pl-4
                                            [&>h3]:text-emerald-200 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-4
                                            [&>p]:mb-6 [&>p]:leading-8
                                            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-8 [&>ul]:space-y-3
                                            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-8 [&>ol]:space-y-3
                                            [&>li]:pl-2 [&>li]:marker:text-emerald-500
                                            [&>strong]:text-white [&>strong]:font-bold
                                            [&>code]:bg-gray-800 [&>code]:text-emerald-300 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded-md
                                            [&>blockquote]:bg-gray-900/50 [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-500 [&>blockquote]:p-6 [&>blockquote]:rounded-r-xl [&>blockquote]:my-8
                                        "
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Keyword Analysis Section — renders after stream completes */}
                {keywordData && (
                    <section className="px-4 sm:px-6 lg:px-8 pb-16">
                        <div className="max-w-5xl mx-auto">
                            <KeywordAnalysis data={keywordData} />
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}