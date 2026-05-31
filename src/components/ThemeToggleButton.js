"use client";

import { useSession } from "next-auth/react";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "./ThemeProvider";

export default function ThemeToggleButton() {
  const { data: session, status } = useSession();
  const { isDark, mounted, toggleTheme } = useThemeMode();

  if (status === "loading" || !session || !mounted) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`fixed bottom-5 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 ${isDark ? "border-white/10 bg-[#0A0A0A]/90 text-white shadow-black/30" : "border-slate-200 bg-white/90 text-slate-700 shadow-slate-300/40"}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}