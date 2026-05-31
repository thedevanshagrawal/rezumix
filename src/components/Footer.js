"use client"
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useThemeMode } from "./ThemeProvider";

const Footer = () => {
    const { data: session } = useSession()
    const { theme } = useThemeMode();
    const isDark = theme === "dark";

    // Optional: Hide footer if session exists (Dashboard usually has its own layout)
    if (session) return null;

    return (
        <footer className={`relative overflow-hidden pt-20 pb-10 border-t ${isDark ? "bg-[#050505] border-white/5" : "bg-slate-50 border-slate-200"}`}>

            {/* Background Grid Pattern (Matching Home Page) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                <div className={`absolute inset-0 bg-[size:32px_32px] ${isDark ? "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" : "bg-[linear-gradient(to_right,#cbd5e11f_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e11f_1px,transparent_1px)]"}`} />
                <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] blur-[120px] rounded-full ${isDark ? "bg-blue-600/5" : "bg-sky-500/10"}`} />
            </div>

            <div className="relative z-10 container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="md:col-span-2 space-y-6">
                        <Link href="/">
                            <Image src={'/rezumix_logo.png'} alt='Rezumix' width={200} height={50} className="w-40 opacity-90" />
                        </Link>
                        <p className={`${isDark ? "text-slate-400" : "text-slate-600"} max-w-sm leading-relaxed`}>
                            Empowering careers with AI intelligence. Stop guessing and start getting hired with data-driven insights.
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-4">
                            {[
                                { icon: "Instagram", href: "https://www.instagram.com/the.devanshagrawal" },
                                { icon: "GitHub", href: "https://github.com/thedevanshagrawal" },
                                { icon: "Twitter", href: "https://x.com/_the_devansh" },
                                { icon: "LinkedIn", href: "https://www.linkedin.com/in/thedevanshagrawal/" }
                            ].map((social, idx) => (
                                <Link
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isDark ? "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                                >
                                    {/* Simple mapping for Icons based on index/name or just SVG directly */}
                                    <SocialIcon name={social.icon} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h3 className={`${isDark ? "text-white" : "text-slate-900"} font-bold mb-6`}>Product</h3>
                        <ul className="space-y-4">
                            {[
                                "Resume Checker",
                                "Resume Builder",
                                "Career Path",
                                "Interview Prep",
                                "Skill Analysis"
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link href="/login" className={`${isDark ? "text-slate-400 hover:text-blue-400" : "text-slate-600 hover:text-sky-600"} transition-colors text-sm`}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className={`${isDark ? "text-white" : "text-slate-900"} font-bold mb-6`}>Company</h3>
                        <ul className="space-y-4">
                            {[
                                { label: "About", href: "/about" },
                                { label: "Contact", href: "/contact" },
                                { label: "Privacy Policy", href: "/privacy-policy" },
                                { label: "Terms of Service", href: "/terms-of-services" },
                                { label: "Download Rezumix App", href: "/rezumix.apk", download: true }
                            ].map(({ label, href, download }, idx) => (
                                <li key={idx}>
                                    {download ? (
                                        <a
                                            href={href}
                                            download
                                            className={`${isDark ? "text-gray-400 hover:text-emerald-400" : "text-slate-600 hover:text-emerald-600"} transition-colors duration-300`}
                                        >
                                            {label}
                                        </a>
                                    ) : (
                                        <Link
                                            href={href}
                                            className={`${isDark ? "text-gray-400 hover:text-pink-400" : "text-slate-600 hover:text-pink-600"} transition-colors duration-300`}
                                        >
                                            {label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                    <p className={`${isDark ? "text-slate-600" : "text-slate-500"} text-sm`}>© {new Date().getFullYear()} Rezumix Inc. All rights reserved.</p>

                    {/* Big Brand Text (Subtle) */}
                    <div className="hidden md:block">
                        <span className={`text-2xl font-bold bg-clip-text text-transparent select-none ${isDark ? "bg-gradient-to-r from-slate-800 to-slate-900" : "bg-gradient-to-r from-slate-300 to-slate-400"}`}>
                            REZUMIX
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Helper for Social Icons to keep JSX clean
const SocialIcon = ({ name }) => {
    // You can replace these with Lucide icons if you import them
    switch (name) {
        case "Instagram": return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;
        case "GitHub": return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>;
        case "Twitter": return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>;
        case "LinkedIn": return <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>;
        default: return null;
    }
};

export default Footer; 