"use client";

import UserSidebar from "./user-sidebar/page";
import ThemeToggle from "@/components/ThemeToggle";
import { useThemeMode } from "@/hooks/use-theme-mode";

// Global Background for Dashboard
const GridBackground = ({ isLight = false }) => (
    <div className={`fixed inset-0 z-0 pointer-events-none ${isLight ? "bg-[#f8fafc]" : "bg-[#050505]"}`}>
        <div className={`absolute inset-0 bg-[size:32px_32px] ${isLight ? "bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)]" : "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"}`} />
    </div>
);

export default function DashboardLayout({ children }) {
    const { isLight } = useThemeMode();

    return (
        <div className={`min-h-screen ${isLight ? "bg-[#f8fafc] text-slate-900" : "bg-[#050505] text-slate-200"}`}>

            <GridBackground isLight={isLight} />

            {/* Sidebar Component */}
            <UserSidebar />

            {/* Main Content Area 
                - md:pl-20: Desktop par left padding 80px (Collapsed Sidebar width).
                - pt-16: Mobile par top padding header ke liye.
                - md:pt-0: Desktop par top padding hata di.
            */}
            <main className="relative z-10 transition-all duration-300 ease-in-out md:pl-20 pt-16 md:pt-0">
                <div className="p-4 md:p-8 min-h-screen max-w-[1600px] mx-auto">
                    <div className="mb-4 flex justify-end">
                        <ThemeToggle />
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}