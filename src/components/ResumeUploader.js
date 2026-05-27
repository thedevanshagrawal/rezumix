"use client"
import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ResumeUploader() {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const { data: session } = useSession()
    const router = useRouter()

    if (!session) {
        router.push("/")
        return null;
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.docx')) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setError('');
            toast.success(`File selected: ${selectedFile.name}`);
        } else {
            setFile(null);
            setFileName('');
            const errorMsg = 'Please upload a .docx file (Microsoft Word).';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    const clearFile = () => {
        setFile(null);
        setFileName('');
        setError('');
        setResult(null);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            const msg = 'Please select a file.';
            setError(msg);
            toast.error(msg);
            return;
        }

        setLoading(true);
        setError('');
        toast.loading('Analyzing your resume...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/analyze-resume', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Analysis failed');
            
            toast.success('Resume analysis complete! Check the results below.');
            setResult(data);
        } catch (err) {
            const errorMsg = err.message || 'Failed to analyze resume';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            
            {/* Upload Area */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Resume Analysis</h2>
                    <p className="text-slate-400 text-sm">Upload your resume to get instant AI feedback on formatting and keywords.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!file ? (
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".docx"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                id="file-upload"
                            />
                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center transition-all group-hover:border-blue-500/50 group-hover:bg-blue-500/5">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/10 transition-colors">
                                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                                </div>
                                <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-500">Supported format: .docx (Word)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-medium truncate">{fileName}</p>
                                    <p className="text-xs text-slate-500">Ready to analyze</p>
                                </div>
                            </div>
                            <button 
                                type="button" 
                                onClick={clearFile}
                                className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Analyzing Resume...</span>
                            </>
                        ) : (
                            <>
                                <span>Run Analysis</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Results Area */}
            {result && (
                <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                        <h3 className="text-xl font-bold text-white">Analysis Complete</h3>
                    </div>

                    <div className="prose prose-invert max-w-none">
                        {/* Custom rendering for AI text response */}
                        <div className="space-y-4 text-slate-300 leading-relaxed text-sm md:text-base">
                            {result.aiInsights.split('\n').map((line, idx) => {
                                // Headlines
                                if (line.startsWith('**') && line.endsWith('**')) {
                                    return <h4 key={idx} className="text-lg font-bold text-white mt-6 mb-2">{line.replace(/\*\*/g, '')}</h4>
                                }
                                // Bullet points
                                if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                                    return (
                                        <div key={idx} className="flex gap-2 ml-2">
                                            <span className="text-blue-400 mt-1.5">•</span>
                                            <span>{line.replace(/^[\*\-]\s*/, '')}</span>
                                        </div>
                                    )
                                }
                                // Standard paragraph
                                return line.trim() ? <p key={idx}>{line}</p> : null
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}