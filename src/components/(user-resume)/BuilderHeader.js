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
  toggleTheme,
  currentTheme
}) {
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef(null);

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
    await new Promise((resolve) => setTimeout(resolve, 100));
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

  return (
    <header className="flex justify-between items-center">
      <div className="flex items-center">
        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className="mr-4">
          Toggle to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode
        </button>

        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => setActiveTemplate(template.id)}
            className={`text-sm p-2 ${activeTemplate === template.id ? "bg-blue-500 text-white" : "text-blue-600"}`}
          >
            {template.label}
          </button>
        ))}
      </div>
      <div>
        <button onClick={onSave} disabled={saving} className="ml-4 text-sm p-2">
          {saving ? "Saving..." : "Save"} {saveMsg && <span>{saveMsg}</span>}
        </button>
      </div>
    </header>
  );
}
