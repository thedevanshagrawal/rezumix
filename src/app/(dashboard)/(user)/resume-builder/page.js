"use client";
import sampleResumeData from "@/components/(user-resume)/sampleData";
import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ResumeForm from "@/components/(user-resume)/ResumeForm";
import ResumePreview from "@/components/(user-resume)/ResumePreview";
import BuilderHeader from "@/components/(user-resume)/BuilderHeader";

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

  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [isSample, setIsSample] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState("modern");
  const [mobileView, setMobileView] = useState("form");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem("resumeBuilderData");
    if (saved) {
      setResumeData(JSON.parse(saved));
      setIsSample(false);
    } else {
      setIsSample(true);
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (status === "loading") return null;

  return (
    <div className={`flex flex-col gap-6 ${theme}`}>
      <div className="bg-gray-950 border border-white/10 rounded-2xl p-2 backdrop-blur-sm overflow-visible">
        <BuilderHeader
          resumeData={resumeData}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          mobileView={mobileView}
          setMobileView={setMobileView}
          onSave={handleSave}
          saving={saving}
          saveMsg={saveMsg}
          toggleTheme={toggleTheme}
          currentTheme={theme}
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">
        <div className={`flex-1 bg-gray-950 border border-white/10 rounded-2xl p-4 ${mobileView === "preview" ? "hidden lg:block" : "block"}`}>
          <ResumeForm resumeData={resumeData} updateResumeData={updateResumeData} />

          {suggestions && (
            <div className="mt-6 p-4 border-t border-white/10">
              <h3 className="text-blue-400 text-sm font-bold mb-3">AI Suggestions</h3>
              {Object.entries(suggestions).map(([key, value]) => (
                <p key={key} className="text-xs text-slate-400 mb-2 italic">&quot;{value}&quot;</p>
              ))}
            </div>
          )}
        </div>
        <div className={`flex-1 bg-gray-950 border border-white/10 rounded-2xl p-4 overflow-hidden ${mobileView === "form" ? "invisible h-0 lg:visible lg:h-auto" : "block"}`}>
          <div className="sticky top-4">
            <ResumePreview
              resumeData={isSample ? sampleResumeData : resumeData}
              activeTemplate={activeTemplate}
              isSample={isSample} />
          </div>
        </div>
      </div>
    </div>
  );
}
