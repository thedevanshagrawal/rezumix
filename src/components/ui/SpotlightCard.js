"use client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useThemeMode } from "@/components/ThemeProvider";

export default function SpotlightCard({
    children,
    className = "",
    glowColor = "rgba(59, 130, 246, 0.1)"
}) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const { theme } = useThemeMode();
    const isDark = theme === "dark";

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`relative overflow-hidden group transition-colors duration-300 ${isDark ? "border border-white/10 bg-neutral-900/50" : "border border-slate-200 bg-white shadow-lg shadow-slate-200/40"} ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            650px circle at ${mouseX}px ${mouseY}px,
                            ${glowColor},
                            transparent 80%
                        )
                    `,
                }}
            />
            <div className="relative h-full z-10">{children}</div>
        </div>
    );
}