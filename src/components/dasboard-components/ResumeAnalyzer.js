"use client";
import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, ArrowRight, Zap, Target, TrendingUp, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { useThemeMode } from "@/hooks/use-theme-mode";
import ThemeToggle from "@/components/ThemeToggle";

export default function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState("");
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({ hero: false, upload: false, results: false });
    const { isLight } = useThemeMode();

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

    // ✅ PDF aur DOCX dono accept karo
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
                            setResult((prev) => prev + data.content);
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
        <div className={`min-h-screen relative overflow-hidden font-sans ${isLight ? "bg-[#f8fafc] text-slate-900 selection:bg-emerald-500/20" : "bg-black text-white selection:bg-emerald-500/30"}`}>
            {/* Background */}
            <div className="inset-0 z-0 fixed pointer-events-none">
                <div className={`absolute inset-0 ${isLight ? "bg-gradient-to-br from-white via-slate-50 to-slate-100" : "bg-gradient-to-br from-slate-950 via-black to-slate-950"}`}></div>
                <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] ${isLight ? "bg-emerald-300/20" : "bg-emerald-600/10"}`} style={{ transform: `translateY(${scrollY * 0.1}px)` }}></div>
                <div className={`absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px] ${isLight ? "bg-teal-300/20" : "bg-teal-600/10"}`} style={{ transform: `translateY(${-scrollY * 0.1}px)` }}></div>
            </div>

            <div className="relative z-10">
                <div className="px-4 sm:px-6 lg:px-8 pt-6 flex justify-end">
                    <ThemeToggle />
                </div>
                <section className="px-4 sm:px-6 lg:px-8 py-12">
                    <div className="max-w-5xl mx-auto">
                        <div className={`transition-all duration-1000 ease-out ${isVisible.upload ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            <div className={`relative p-8 rounded-3xl shadow-2xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-emerald-500/20"}`}>

                                <div className="text-center mb-8">
                                    <h2 className={`text-3xl font-bold mb-2 ${isLight ? "text-slate-950" : "text-white"}`}>Resume Audit</h2>
                                    <p className={isLight ? "text-slate-600" : "text-gray-400"}>Upload your resume for instant AI scoring and feedback</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {!file ? (
                                        <div className="relative group cursor-pointer">
                                            {/* ✅ PDF aur DOCX dono accept */}
                                            <input type="file" accept=".docx,.pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
                                            <div className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center transition-all group-hover:bg-emerald-500/5 ${isLight ? "border-slate-200 bg-slate-50 group-hover:border-emerald-400" : "border-gray-700 group-hover:border-emerald-500"}`}>
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 text-emerald-500 group-hover:scale-110 transition-transform ${isLight ? "bg-white border border-slate-200" : "bg-gray-800"}`}>
                                                    <UploadCloud size={32} />
                                                </div>
                                                <h3 className={`text-xl font-semibold mb-2 ${isLight ? "text-slate-950" : "text-white"}`}>Drop your resume here</h3>
                                                {/* ✅ Updated text */}
                                                <p className={isLight ? "text-slate-500" : "text-gray-500"}>Supports .docx and .pdf files</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`rounded-xl p-6 flex items-center justify-between ${isLight ? "bg-white border border-slate-200" : "bg-[#111] border border-gray-700"}`}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <p className={isLight ? "text-slate-950 text-lg font-medium" : "text-white text-lg font-medium"}>{fileName}</p>
                                                    <p className={`text-sm flex items-center gap-2 mt-1 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}>
                                                        <CheckCircle className="w-4 h-4" /> Ready for scan
                                                    </p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => { setFile(null); setFileName(""); setResult(""); }} className={`p-2 rounded-lg transition-colors ${isLight ? "text-slate-400 hover:bg-slate-100 hover:text-slate-950" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
                                                <X size={24} />
                                            </button>
                                        </div>
                                    )}

                                    {error && (
                                        <div className={`p-4 rounded-xl flex items-center gap-3 ${isLight ? "bg-red-50 border border-red-200 text-red-700" : "bg-red-900/20 border border-red-900/50 text-red-400"}`}>
                                            <AlertCircle size={20} />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            disabled={!file || loading}
                                            className={`px-10 py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg cursor-pointer ${isLight ? "bg-slate-950 text-white hover:bg-slate-800 shadow-slate-300/60" : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/20"}`}
                                        >
                                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : <>Run Analysis <ArrowRight className="w-5 h-5" /></>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Results Section */}
                {result && (
                    <section className="px-4 sm:px-6 lg:px-8 pb-16">
                        <div className="max-w-5xl mx-auto">
                            <div className={`transition-all duration-1000 ease-out ${isVisible.results ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <div className={`relative p-8 rounded-3xl shadow-2xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-emerald-500/20"}`}>

                                    <div className={`flex items-center gap-4 mb-8 pb-6 ${isLight ? "border-b border-slate-200" : "border-b border-gray-800"}`}>
                                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className={`text-2xl font-bold ${isLight ? "text-slate-950" : "text-white"}`}>Analysis Report</h2>
                                            <p className={`text-sm ${isLight ? "text-slate-600" : "text-gray-400"}`}>Actionable feedback for improvement</p>
                                        </div>
                                    </div>

                                    <div
                                        dangerouslySetInnerHTML={renderMarkdown(result)}
                                        className="
                                            text-lg leading-loose
                                            [&>h1]:text-emerald-400 [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mt-10 [&>h1]:mb-6
                                            [&>h2]:text-slate-950 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-5 [&>h2]:border-l-4 [&>h2]:border-emerald-500 [&>h2]:pl-4
                                            [&>h3]:text-emerald-700 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-4
                                            [&>p]:mb-6 [&>p]:leading-8
                                            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-8 [&>ul]:space-y-3
                                            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-8 [&>ol]:space-y-3
                                            [&>li]:pl-2 [&>li]:marker:text-emerald-500
                                            [&>strong]:text-slate-950 [&>strong]:font-bold
                                            [&>code]:bg-slate-100 [&>code]:text-emerald-700 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded-md
                                            [&>blockquote]:bg-slate-50 [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-500 [&>blockquote]:p-6 [&>blockquote]:rounded-r-xl [&>blockquote]:my-8
                                        "
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}