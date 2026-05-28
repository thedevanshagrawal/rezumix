"use client";

import ModernTemplate from "@/components/(user-resume)/templates/ModernTemplate";
import ClassicTemplate from "@/components/(user-resume)/templates/ClassicTemplate";
import MinimalTemplate from "@/components/(user-resume)/templates/MinimalTemplate";
import ExecutiveTemplate from "@/components/(user-resume)/templates/ExecutiveTemplate";
import CreativeTemplate from "@/components/(user-resume)/templates/CreativeTemplate";

function sanitizeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  // Allow only http, https, or mailto links
  if (/^(https?|mailto):/i.test(trimmed)) {
    return trimmed;
  }
  // If it's a domain name without protocol, prefix it safely
  if (/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return "";
}

export default function ResumePreview({ resumeData, activeTemplate, isSample }) {
  // Deep-copy to avoid mutation of state directly
  const sanitizedData = JSON.parse(JSON.stringify(resumeData));
  
  if (sanitizedData.personalInfo) {
    sanitizedData.personalInfo.linkedin = sanitizeUrl(sanitizedData.personalInfo.linkedin);
    sanitizedData.personalInfo.portfolio = sanitizeUrl(sanitizedData.personalInfo.portfolio);
  }
  if (Array.isArray(sanitizedData.projects)) {
    sanitizedData.projects = sanitizedData.projects.map(p => ({
      ...p,
      link: sanitizeUrl(p.link)
    }));
  }
  if (Array.isArray(sanitizedData.certifications)) {
    sanitizedData.certifications = sanitizedData.certifications.map(c => ({
      ...c,
      url: sanitizeUrl(c.url)
    }));
  }

  const isEmpty =
    !isSample &&
    !sanitizedData.personalInfo.fullName &&
    !sanitizedData.personalInfo.email &&
    sanitizedData.experience.length === 0 &&
    sanitizedData.skills.technical.length === 0 &&
    sanitizedData.skills.soft.length === 0 &&
    sanitizedData.education.length === 0;

  return (
    <div className="p-6 flex flex-col items-center bg-gray-950">
      
      {/* Live Preview + Sample Badge */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className="text-xs text-white/30 uppercase tracking-widest">
          Live Preview
        </p>
        {isSample && (
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
            Sample
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="w-full max-w-[680px] aspect-[1/1.414] bg-gray-950 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-white/20">
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
          className="shadow-2xl rounded-lg overflow-hidden"
        >
          {activeTemplate === "modern" && <ModernTemplate data={sanitizedData} />}
          {activeTemplate === "classic" && <ClassicTemplate data={sanitizedData} />}
          {activeTemplate === "minimal" && <MinimalTemplate data={sanitizedData} />}
          {activeTemplate === "executive" && <ExecutiveTemplate data={sanitizedData} />}
          {activeTemplate === "creative" && <CreativeTemplate data={sanitizedData} />}
        </div>
      )}
    </div>
  );
}