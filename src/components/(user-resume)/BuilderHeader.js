"use client";

import { useState, useRef, useEffect } from "react";
import { exportToPDF, exportToJSON, exportToTXT, exportToDOCX } from "@/lib/exportPDF";
import { createPortal } from "react-dom";
import { useThemeMode } from "@/hooks/use-theme-mode";

const TEMPLATES = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
  { id: "executive", label: "Executive" },
  { id: "creative", label: "Creative" }
];

export default function BuilderHeader({
  resumeData,
  activeTemplate,
  setActiveTemplate,
  mobileView,
  setMobileView,
  onSave,
  saving,
  saveMsg,
  onGetSuggestions,
  suggesting,
}) {
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);
  const { isLight } = useThemeMode();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
      setTimeout(() => setExportOpen(false), 300);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format = "pdf") => {
    setExportOpen(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    setExporting(true);
    try {
      const filename = resumeData.personalInfo.fullName || "resume";
      if (format === "pdf") {
        await exportToPDF("resume-preview-root", filename);
      } else if (format === "json") {
        exportToJSON(resumeData, filename);
      } else if (format === "txt") {
        exportToTXT(resumeData, filename);
      } else if (format === "docx") {
        await exportToDOCX(resumeData, filename);
      }
    } finally {
      setExporting(false);
    }
  };

  const getDropdownPosition = () => {
    if (!exportRef.current) return {};
    const rect = exportRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 99999,
      width: "200px",
      backgroundColor: "#0f0f14",
      border: isLight ? "1px solid rgba(148,163,184,0.35)" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      boxShadow: isLight ? "0 25px 50px rgba(15,23,42,0.12)" : "0 25px 50px rgba(0,0,0,0.8)",
    };
  };

  return (
    <header className={`h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 ${isLight ? "bg-white border-b border-slate-200" : "bg-gray-950 border-b border-white/10"}`}>

      {/* Center: Template Switcher (desktop) */}
      <div className={`hidden md:flex items-center gap-1 rounded-lg p-1 ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 active:scale-95 cursor-pointer ${
              activeTemplate === t.id
                ? "bg-blue-600 text-white font-medium shadow"
                : isLight ? "text-slate-500 hover:text-slate-900" : "text-white/50 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Right: Mobile toggle + Buttons */}
      <div className="flex items-center gap-2">

        {/* Mobile view toggle */}
        <div className={`flex md:hidden items-center rounded-lg p-1 ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
          <button
            onClick={() => setMobileView("form")}
            className={`px-3 py-1 text-sm rounded-md transition-all active:scale-95 ${
              mobileView === "form" ? "bg-blue-600 text-white" : isLight ? "text-slate-500" : "text-white/50"
            }`}
          >
            Form
          </button>
          <button
            onClick={() => setMobileView("preview")}
            className={`px-3 py-1 text-sm rounded-md transition-all active:scale-95 ${
              mobileView === "preview" ? "bg-blue-600 text-white" : isLight ? "text-slate-500" : "text-white/50"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Save Message */}
        {saveMsg && (
          <span className={`text-xs ${isLight ? "text-slate-500" : "text-white/60"}`}>{saveMsg}</span>
        )}

        {/* AI Suggestions Button */}
        <button
          onClick={onGetSuggestions}
          disabled={suggesting}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 ${isLight ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900" : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"}`}
        >
          {suggesting ? "Analyzing..." : "✨ AI Suggestions"}
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={saving}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 ${isLight ? "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900" : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"}`}
        >
          {saving ? "Saving..." : "Save Resume"}
        </button>

        {/* Export Dropdown */}
        <div ref={exportRef}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            disabled={exporting}
            className={`flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 ${isLight ? "bg-slate-950 text-white hover:bg-slate-800" : "bg-white text-black hover:bg-slate-200"}`}
          >
            {exporting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Export
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>

          {/* Portal Dropdown */}
          {exportOpen && typeof window !== "undefined" && createPortal(
            <div style={{ ...getDropdownPosition(), ...(isLight ? { backgroundColor: "#ffffff", color: "#0f172a" } : {}) }}>
              {[
                { label: "Export as PDF", format: "pdf",  },
                { label: "Export as DOCX", format: "docx", },
                { label: "Export as JSON", format: "json",  },
                { label: "Export as TXT", format: "txt",  },
              ].map((item) => (
                <button
                  key={item.format}
                  onClick={() => {
                  handleExport(item.format);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 16px",
                    fontSize: "13px",
                    color: isLight ? "#0f172a" : "rgba(255,255,255,0.8)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isLight ? "rgba(148,163,184,0.15)" : "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
}