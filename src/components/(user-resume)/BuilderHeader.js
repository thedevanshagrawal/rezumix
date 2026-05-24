"use client";

import { useState, useRef, useEffect } from "react";
import { exportToPDF, exportToJSON, exportToTXT, exportToDOCX } from "@/lib/exportPDF";
import { createPortal } from "react-dom";

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
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
      setTimeout(() => setExportOpen(false), 300);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

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
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
    };
  };

  return (
    <header className="h-16 bg-gray-950 border-b border-white/10 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">

      {/* Theme Toggle */}
      <button onClick={toggleTheme} className="text-sm font-medium text-white">
        {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      </button>

      {/* Center: Template Switcher (desktop) */}
      <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTemplate(t.id)}
            className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 active:scale-95 cursor-pointer ${
              activeTemplate === t.id
                ? "bg-blue-600 text-white font-medium shadow"
                : "text-white/50 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Right: Mobile toggle + Buttons */}
      <div className="flex items-center gap-2">

        {/* Mobile view toggle */}
        <div className="flex md:hidden items-center bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setMobileView("form")}
            className={`px-3 py-1 text-sm rounded-md transition-all active:scale-95 ${
              mobileView === "form" ? "bg-blue-600 text-white" : "text-white/50"
            }`}
          >
            Form
          </button>
          <button
            onClick={() => setMobileView("preview")}
            className={`px-3 py-1 text-sm rounded-md transition-all active:scale-95 ${
              mobileView === "preview" ? "bg-blue-600 text-white" : "text-white/50"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Save Message */}
        {saveMsg && (
          <span className="text-xs text-white/60">{saveMsg}</span>
        )}

        {/* AI Suggestions Button */}
        <button
          onClick={onGetSuggestions}
          disabled={suggesting}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60"
        >
          {suggesting ? "Analyzing..." : "✨ AI Suggestions"}
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Resume"}
        </button>

        {/* Export Dropdown */}
        <div ref={exportRef}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            disabled={exporting}
            className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 active:scale-95"
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
            <div style={getDropdownPosition()}>
              [
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
                    color: "rgba(255,255,255,0.8)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))
            </div>,
            document.body
          )}
        </div>
      </div>
    </header>
  );
}