"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, TrendingUp, Target, Lightbulb } from "lucide-react";

export default function KeywordAnalysis({ data }) {
    const [isOpen, setIsOpen] = useState(true);

    if (!data) return null;

    const present = data.keyword_analysis?.present || [];
    const missing = data.keyword_analysis?.missing || [];
    const overused = data.keyword_analysis?.overused || [];
    const skillGaps = data.skill_gaps || [];
    const tips = data.improvement_tips || [];

    return (
        <div className="relative bg-[#0A0A0A] border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden">

            {/* Header — clickable to collapse */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-8 text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Keyword & Skill Analysis</h2>
                        <p className="text-gray-400 text-sm">Targeted improvements to strengthen your resume</p>
                    </div>
                </div>
                <div className="text-emerald-500">
                    {isOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
            </button>

            {/* Collapsible Body */}
            {isOpen && (
                <div className="px-8 pb-8 space-y-8 border-t border-gray-800">

                    {/* ── Keyword Analysis ── */}
                    <div className="pt-8">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-white">Keyword Density</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Present Keywords */}
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-semibold uppercase tracking-wider">Present</span>
                                </div>
                                {present.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {present.map((keyword, i) => (
                                            <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-sm rounded-lg border border-emerald-500/20">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">None detected</p>
                                )}
                            </div>

                            {/* Missing Keywords */}
                            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400 text-sm font-semibold uppercase tracking-wider">Missing</span>
                                </div>
                                {missing.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {missing.map((keyword, i) => (
                                            <span key={i} className="px-3 py-1 bg-red-500/10 text-red-300 text-sm rounded-lg border border-red-500/20">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">None detected</p>
                                )}
                            </div>

                            {/* Overused Phrases */}
                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                                    <span className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">Overused</span>
                                </div>
                                {overused.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {overused.map((phrase, i) => (
                                            <span key={i} className="px-3 py-1 bg-yellow-500/10 text-yellow-300 text-sm rounded-lg border border-yellow-500/20">
                                                {phrase}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">None detected</p>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* ── Skill Gaps ── */}
                    {skillGaps.length > 0 && (
                        <div className="pt-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Target className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-semibold text-white">Skill Gaps</h3>
                            </div>
                            <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
                                <p className="text-gray-400 text-sm mb-4">
                                    Skills commonly expected for your target role that are missing from your resume:
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {skillGaps.map((skill, i) => (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <span className="text-red-300 text-sm font-medium">{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Improvement Tips ── */}
                    {tips.length > 0 && (
                        <div className="pt-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Lightbulb className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-semibold text-white">Improvement Tips</h3>
                            </div>
                            <div className="space-y-3">
                                {tips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-4 p-5 bg-[#111] border border-gray-800 rounded-2xl">
                                        <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed pt-1">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}