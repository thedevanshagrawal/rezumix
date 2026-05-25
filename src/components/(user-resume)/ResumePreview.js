"use client";

import ModernTemplate from "@/components/(user-resume)/templates/ModernTemplate";
import ClassicTemplate from "@/components/(user-resume)/templates/ClassicTemplate";
import MinimalTemplate from "@/components/(user-resume)/templates/MinimalTemplate";
import ExecutiveTemplate from "@/components/(user-resume)/templates/ExecutiveTemplate";
import CreativeTemplate from "@/components/(user-resume)/templates/CreativeTemplate";
import { useThemeMode } from "@/hooks/use-theme-mode";

export default function ResumePreview({ resumeData, activeTemplate, isSample }) {
  const { isLight } = useThemeMode();
  const isEmpty =
    !isSample &&
    !resumeData.personalInfo.fullName &&
    !resumeData.personalInfo.email &&
    resumeData.experience.length === 0 &&
    resumeData.skills.technical.length === 0 &&
    resumeData.skills.soft.length === 0 &&
    resumeData.education.length === 0;

  return (
    <div className={`p-6 flex flex-col items-center ${isLight ? "bg-white" : "bg-gray-950"}`}>
      
      {/* Live Preview + Sample Badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className={`text-xs uppercase tracking-widest ${isLight ? "text-slate-500" : "text-white/30"}`}>
          Live Preview
        </p>
        {isSample && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isLight ? "bg-blue-500/10 text-blue-700 border border-blue-200" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
            Sample
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className={`w-full max-w-[680px] aspect-[1/1.414] border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 ${isLight ? "bg-white border-slate-200 text-slate-400" : "bg-gray-950 border-white/10 text-white/20"}`}>
          <svg
            className="w-12 h-12 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm">Start filling the form to see your resume</p>
        </div>
      ) : (
        <div
          id="resume-preview-root"
          style={{ width: "680px", maxWidth: "100%" }}
          className={`shadow-2xl rounded-lg overflow-hidden ${isLight ? "bg-white" : "bg-transparent"}`}
        >
          {activeTemplate === "modern" && <ModernTemplate data={resumeData} />}
          {activeTemplate === "classic" && <ClassicTemplate data={resumeData} />}
          {activeTemplate === "minimal" && <MinimalTemplate data={resumeData} />}
          {activeTemplate === "executive" && <ExecutiveTemplate data={resumeData} />}
          {activeTemplate === "creative" && <CreativeTemplate data={resumeData} />}
        </div>
      )}
    </div>
  );
}