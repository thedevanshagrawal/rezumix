"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/hooks/use-theme-mode";

export default function ThemeToggle({ className = "" }) {
    const { isLight, toggleTheme } = useThemeMode();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${isLight
                ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                } ${className}`}
        >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="hidden sm:inline">{isLight ? "Dark" : "Light"}</span>
        </button>
    );
}