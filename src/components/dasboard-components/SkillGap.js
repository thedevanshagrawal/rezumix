"use client";
import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Target, Zap, ArrowRight, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useSession } from 'next-auth/react';
import { useThemeMode } from "@/hooks/use-theme-mode";
import ThemeToggle from "@/components/ThemeToggle";

export default function SkillGap() {
    const { data: session, status } = useSession();
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [userjobData, setUserjobData] = useState({ jobRole: "", jobSkill: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState("");
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState({ hero: false, form: false, results: false });
    const { isLight } = useThemeMode();

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setTimeout(() => setIsVisible({ hero: true, form: true, results: false }), 300);
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

    const handleChange = (e) => {
        setUserjobData({ ...userjobData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                    setError("PDF text extraction failed: " + pdfErr.message);
                    setLoading(false);
                    return;
                }

                if (!text || text.trim().length === 0) {
                    setError("Could not extract text from PDF. Make sure it's not a scanned image.");
                    setLoading(false);
                    return;
                }

                response = await fetch(`/api/skill-gap?fileType=pdf`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text,
                        jobRole: userjobData.jobRole,
                        jobSkill: userjobData.jobSkill,
                        userEmail
                    })
                });

            } else {
                // ✅ DOCX — original flow same
                const formData = new FormData();
                formData.append("file", file);
                formData.append("jobRole", userjobData.jobRole);
                formData.append("jobSkill", userjobData.jobSkill);
                formData.append("userEmail", userEmail);

                response = await fetch(`/api/skill-gap?fileType=docx`, {
                    method: "POST",
                    body: formData
                });
            }

            if (!response.ok) {
                const errData = await response.json();
                setError("Server error: " + (errData.error || "Unknown error"));
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
                        } catch (e) { console.error(e); }
                    }
                }
            }
        } catch (err) {
            setError("Failed to analyze resume: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen relative overflow-hidden font-sans ${isLight ? "bg-[#f8fafc] text-slate-900 selection:bg-cyan-500/20" : "bg-black text-white selection:bg-cyan-500/30"}`}>
            {/* Background */}
            <div className="inset-0 z-0 fixed pointer-events-none">
                <div className={`absolute inset-0 ${isLight ? "bg-gradient-to-br from-white via-slate-50 to-slate-100" : "bg-gradient-to-br from-slate-950 via-black to-slate-950"}`}></div>
                <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[100px] ${isLight ? "bg-cyan-300/20" : "bg-cyan-600/10"}`} style={{ transform: `translateY(${scrollY * 0.1}px)` }}></div>
                <div className={`absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px] ${isLight ? "bg-blue-300/20" : "bg-blue-600/10"}`} style={{ transform: `translateY(${-scrollY * 0.1}px)` }}></div>
            </div>

            <div className="relative z-10">
                <div className="px-4 sm:px-6 lg:px-8 pt-6 flex justify-end">
                    <ThemeToggle />
                </div>
                <section className="px-4 sm:px-6 lg:px-8 py-12">
                    <div className="max-w-6xl mx-auto">
                        <div className={`transition-all duration-1000 ease-out ${isVisible.form ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                            <div className="grid lg:grid-cols-5 gap-8">

                                {/* Left Panel */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className={`rounded-3xl p-6 shadow-xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-cyan-500/20"}`}>
                                        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isLight ? "text-slate-950" : "text-white"}`}>
                                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-600 text-sm">1</span> Resume
                                        </h3>

                                        {!file ? (
                                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isLight ? "border-slate-200 hover:border-cyan-500 hover:bg-cyan-500/5" : "border-gray-700 hover:border-cyan-500 hover:bg-cyan-500/5"}`}>
                                                <UploadCloud className={`w-8 h-8 mb-2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                                                {/* ✅ Updated text */}
                                                <p className={isLight ? "text-sm text-slate-500" : "text-sm text-gray-400"}>Upload .docx or .pdf</p>
                                                <input type="file" accept=".docx,.pdf" className="hidden" onChange={handleFileChange} />
                                            </label>
                                        ) : (
                                            <div className={`rounded-xl p-4 flex items-center justify-between ${isLight ? "bg-white border border-slate-200" : "bg-[#111] border border-gray-700"}`}>
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-cyan-400" />
                                                    <span className={`text-sm truncate max-w-[120px] ${isLight ? "text-slate-950" : "text-white"}`}>{fileName}</span>
                                                </div>
                                                <button onClick={() => { setFile(null); setFileName(""); }} className={isLight ? "text-slate-400 hover:text-slate-950" : "text-gray-400 hover:text-white"}><X size={16} /></button>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`rounded-3xl p-6 shadow-xl ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-cyan-500/20"}`}>
                                        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isLight ? "text-slate-950" : "text-white"}`}>
                                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-600 text-sm">2</span> Goal
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className={`text-xs font-medium uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>Target Role</label>
                                                <input required name="jobRole" type="text" placeholder="e.g. Senior Dev" value={userjobData.jobRole} onChange={handleChange} className={`w-full rounded-lg px-4 py-3 outline-none ${isLight ? "bg-white border border-slate-200 text-slate-900 focus:border-cyan-500" : "bg-[#111] border border-gray-700 text-white focus:border-cyan-500"}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className={`text-xs font-medium uppercase ${isLight ? "text-slate-500" : "text-gray-400"}`}>Skills</label>
                                                <input name="jobSkill" type="text" placeholder="e.g. React, AWS" value={userjobData.jobSkill} onChange={handleChange} className={`w-full rounded-lg px-4 py-3 outline-none ${isLight ? "bg-white border border-slate-200 text-slate-900 focus:border-cyan-500" : "bg-[#111] border border-gray-700 text-white focus:border-cyan-500"}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={handleSubmit} disabled={!file || loading} className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg cursor-pointer ${isLight ? "bg-slate-950 hover:bg-slate-800 text-white shadow-slate-300/60" : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/20"}`}>
                                        {loading ? <Loader2 className="animate-spin" /> : <>Identify Gaps <ArrowRight size={20} /></>}
                                    </button>

                                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                                </div>

                                {/* Right Panel */}
                                <div className="lg:col-span-3">
                                    {result ? (
                                        <div className={`rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${isLight ? "bg-white border border-slate-200" : "bg-[#0A0A0A] border border-cyan-500/20"}`}>
                                            <div className={`flex items-center gap-4 mb-6 pb-6 ${isLight ? "border-b border-slate-200" : "border-b border-gray-800"}`}>
                                                <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                                                    <Target size={24} />
                                                </div>
                                                <h2 className={`text-2xl font-bold ${isLight ? "text-slate-950" : "text-white"}`}>Skill Gap Analysis</h2>
                                            </div>

                                            <div className="
                                                prose max-w-none text-lg leading-loose
                                                [&>h1]:text-cyan-400 [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mt-10 [&>h1]:mb-6
                                                [&>h2]:text-slate-950 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-5 [&>h2]:border-l-4 [&>h2]:border-cyan-500 [&>h2]:pl-4
                                                [&>h3]:text-cyan-700 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-4
                                                [&>p]:mb-6 [&>p]:leading-8
                                                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-8 [&>ul]:space-y-3
                                                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-8 [&>ol]:space-y-3
                                                [&>li]:pl-2 [&>li]:marker:text-cyan-500
                                                [&>strong]:font-bold
                                                [&>blockquote]:bg-slate-50 [&>blockquote]:border-l-4 [&>blockquote]:border-cyan-500 [&>blockquote]:p-6 [&>blockquote]:rounded-r-xl [&>blockquote]:my-8
                                            ">
                                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                                    {result}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`h-full border border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8 min-h-[500px] ${isLight ? "bg-white border-slate-200" : "bg-[#0A0A0A] border-gray-800"}`}>
                                            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6">
                                                <Zap className="w-10 h-10 text-cyan-500" />
                                            </div>
                                            <h3 className={`text-xl font-semibold ${isLight ? "text-slate-700" : "text-gray-400"}`}>Analysis Waiting</h3>
                                            <p className={`mt-2 max-w-xs ${isLight ? "text-slate-500" : "text-gray-600"}`}>Results will appear here...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}