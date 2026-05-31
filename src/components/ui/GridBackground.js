"use client";

import { useThemeMode } from "@/components/ThemeProvider";

export default function GridBackground({
    topColor = "bg-blue-600/5",
    bottomColor = "bg-purple-600/5"
}) {
    const { theme } = useThemeMode();
    const isDark = theme === "dark";

    return (
        <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-300 ${isDark ? "bg-[#050505]" : "bg-slate-50"}`}>
            <div className={`absolute inset-0 bg-[size:32px_32px] ${isDark ? "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" : "bg-[linear-gradient(to_right,#cbd5e11f_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e11f_1px,transparent_1px)]"}`} />
            <div className={`absolute top-0 left-0 w-full h-[60vh] blur-[120px] rounded-full mix-blend-screen ${isDark ? topColor : "bg-sky-500/10"}`} />
            <div className={`absolute bottom-0 right-0 w-full h-[60vh] blur-[120px] rounded-full mix-blend-screen ${isDark ? bottomColor : "bg-indigo-500/10"}`} />
        </div>
    );
}