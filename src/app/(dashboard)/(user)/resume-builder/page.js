"use client";
import sampleResumeData from "@/components/(user-resume)/sampleData";
import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ResumeForm from "@/components/(user-resume)/ResumeForm";
import ResumePreview from "@/components/(user-resume)/ResumePreview";
import BuilderHeader from "@/components/(user-resume)/BuilderHeader";
import { useThemeMode } from "@/hooks/use-theme-mode";


const defaultResumeData = {
  personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", summary: "" },
  experience: [],
  education: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
};

export default function BuilderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isLight } = useThemeMode();

  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [isSample, setIsSample] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState("modern");
  const [mobileView, setMobileView] = useState("form");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [suggesting, setSuggesting] = useState(false);

 useEffect(() => {
  const saved = localStorage.getItem("resumeBuilderData");
  if (saved) {
    setResumeData(JSON.parse(saved));
    setIsSample(false);
  } else {
    setIsSample(true);
  }
}, []);

  useEffect(() => {
  if (!isSample) {
    localStorage.setItem("resumeBuilderData", JSON.stringify(resumeData));
  }
}, [resumeData, isSample]);

  const updateResumeData = useCallback((section, value) => {
  setResumeData((prev) => ({ ...prev, [section]: value }));
  setIsSample(false);
}, []);

  const handleSave = async () => {
    const userEmail = session?.user?.email;
    if (!userEmail) return;
    setSaving(true);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, ...resumeData }),
      });
      const data = await res.json();
      setSaveMsg(data.success ? "✅ Saved!" : "❌ Error");
    } catch (err) {
      setSaveMsg("❌ Error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  if (status === "loading") return null;

  return (
    <div className={`flex flex-col gap-6 ${isLight ? "text-slate-900" : "text-slate-200"}`}>
      {/* 1. Header with same style as dashboard cards */}
      <div className={`rounded-2xl p-2 backdrop-blur-sm overflow-visible ${isLight ? "bg-white border border-slate-200" : "bg-gray-950 border border-white/10"}`}>
        <BuilderHeader
          resumeData={resumeData}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          mobileView={mobileView}
          setMobileView={setMobileView}
          onSave={handleSave}
          saving={saving}
          saveMsg={saveMsg}
        />
      </div>

      {/* 2. Main content area: Responsive Flex */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">

        {/* Form Section */}
        <div className={`flex-1 rounded-2xl p-4 ${mobileView === "preview" ? "hidden lg:block" : "block"} ${isLight ? "bg-white border border-slate-200" : "bg-gray-950 border border-white/10"}`}>
          <ResumeForm resumeData={resumeData} updateResumeData={updateResumeData} />

          {suggestions && (
            <div className={`mt-6 p-4 border-t ${isLight ? "border-slate-200" : "border-white/10"}`}>
              <h3 className={`text-sm font-bold mb-3 ${isLight ? "text-blue-700" : "text-blue-400"}`}>AI Suggestions</h3>
              {Object.entries(suggestions).map(([key, value]) => (
                <p key={key} className={`text-xs mb-2 italic ${isLight ? "text-slate-500" : "text-slate-400"}`}>"{value}"</p>
              ))}
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className={`flex-1 rounded-2xl p-4 overflow-hidden ${mobileView === "form" ? "invisible h-0 lg:visible lg:h-auto": "block"} ${isLight ? "bg-white border border-slate-200" : "bg-gray-950 border border-white/10"}`}>
          <div className="sticky top-4">
            <ResumePreview 
  resumeData={isSample ? sampleResumeData : resumeData} 
  activeTemplate={activeTemplate} 
  isSample={isSample} 
/>
          </div>
        </div>

      </div>
    </div>
  );
}