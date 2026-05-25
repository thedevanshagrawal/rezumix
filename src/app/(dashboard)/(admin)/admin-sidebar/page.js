"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Menu, X, LayoutDashboard, LogOut, FilePlus, Sparkles, Briefcase, LampDesk, Video, BarChart3, User2, User, FileText, CheckCircle, Scroll, Brain, ClipboardCheck } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useThemeMode } from '@/hooks/use-theme-mode'

const SIDEBAR_LINKS = [
    { label: "Dashboard", href: "/admindashboard", icon: LayoutDashboard },
    { label: "Resume Analyzer", href: "/admin-resume-analyzer", icon: FilePlus },
    { label: "Career Path", href: "/admin-recommend-career", icon: Briefcase },
    { label: "Skill Gap", href: "/admin-skill-gap", icon: LampDesk },
    { label: "Personality Prediction", href: "/admin-personality-prediction", icon: User },
    { label: "Mock Interview", href: "/admin-mock-interview", icon: Video },
    { label: "My Interviews", href: "/admin-my-interview", icon: BarChart3 },
    { label: "All Users", href: "/all-users", icon: User2 },
    { label: "All Resumes", href: "/all-resumes", icon: FileText },
    { label: "All Recommendations", href: "/all-recommendations", icon: CheckCircle },
    { label: "All Mock Interviews", href: "/all-mock-interviews", icon: Scroll },
    { label: "All Skill Gaps", href: "/all-skill-gaps", icon: Brain },
    { label: "All OTPs", href: "/all-otps", icon: ClipboardCheck },
    { label: "Profile", href: "/admin-profile", icon: User2 },
]

export default function AdminSidebar() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(true)
    const { isLight } = useThemeMode()

    // Auth Protection
    useEffect(() => {
        if (status === "loading") return
        if (!session || status === "unauthenticated") {
            router.replace("/")
        }
        if (session?.user?.role === "admin") {
            router.replace("/admindashboard")
        }
        if(session?.user?.role === "user") {
            router.replace("/dashboard")
        }
    }, [session, status, router])

    // Lock Body Scroll
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [mobileOpen])

    const toggleMobileMenu = () => setMobileOpen(!mobileOpen)
    const closeMobileMenu = () => setMobileOpen(false)

    const userName = useMemo(() => session?.user?.name || "User", [session])
    const userEmail = useMemo(() => session?.user?.email || "", [session])

    if (status === "loading") return null;

    return (
        <>
            {/* --- Mobile Header --- */}
            <div className={`md:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-md z-50 flex items-center justify-between px-4 border-b ${isLight ? 'bg-white/90 border-slate-200' : 'bg-[#050505]/90 border-white/10'}`}>
                <div className="flex items-center gap-3">
                    <button onClick={toggleMobileMenu} className={`p-2 -ml-2 ${isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                        <Menu size={24} />
                    </button>
                    {/* Mobile Logo */}
                    <div className="h-8 w-auto">
                        <Image
                            src="/rezumix_logo.png"
                            width={120}
                            height={40}
                            alt="Rezumix"
                            className="h-full w-auto object-contain"
                        />
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                    {userName[0]}
                </div>
            </div>

            {/* --- Mobile Overlay --- */}
            {mobileOpen && (
                <div onClick={closeMobileMenu} className={`md:hidden fixed inset-0 z-40 backdrop-blur-sm ${isLight ? 'bg-slate-900/20' : 'bg-black/80'}`} />
            )}

            {/* --- Sidebar --- */}
            <aside
                onMouseEnter={() => setCollapsed(false)}
                onMouseLeave={() => setCollapsed(true)}
                className={`
                    fixed top-0 left-0 h-full z-50 text-slate-300 transition-all duration-300 ease-in-out border-r
                    ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#050505] border-white/10'}
                    
                    /* Mobile State */
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    w-72 
                    
                    /* Desktop State */
                    md:translate-x-0 
                    ${collapsed ? 'md:w-20' : 'md:w-72'} 
                    
                    flex flex-col shadow-2xl
                `}
            >
                {/* Logo Area - PERFECTLY HANDLED */}
                <div className={`h-20 flex items-center justify-center md:justify-start px-0 md:px-6 relative overflow-hidden border-b ${isLight ? 'border-slate-200' : 'border-white/5'}`}>

                    {/* 1. Collapsed State: Show Icon (Hidden on Hover/Mobile) */}
                    <div className={`absolute transition-all duration-300 flex items-center justify-center ${collapsed ? 'opacity-100 scale-100 delay-100' : 'opacity-0 scale-0'}`}>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>

                    {/* 2. Expanded State: Show Full Logo Image */}
                    <div className={`transition-all duration-300 w-full ${collapsed ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-100 translate-x-0 delay-75'}`}>
                        <Image
                            src="/rezumix_logo.png"
                            width={160} // Adjusted width for sidebar
                            height={50}
                            alt="Rezumix"
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
                    {SIDEBAR_LINKS.map((link) => {
                        const Icon = link.icon
                        const active = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMobileMenu}
                                className={`
                                    relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group
                                    ${active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : (isLight ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 border border-transparent' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent')}
                                `}
                            >
                                <div className={`shrink-0 transition-colors ${active ? 'text-blue-400' : (isLight ? 'text-slate-400 group-hover:text-slate-950' : 'text-slate-500 group-hover:text-white')}`}>
                                    <Icon size={20} />
                                </div>

                                <span className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${collapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
                                    {link.label}
                                </span>

                                {/* Active Indicator Dot */}
                                {active && (
                                    <div className={`absolute right-2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`} />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t ${isLight ? 'border-slate-200 bg-white' : 'border-white/5 bg-[#0A0A0A]'}`}>
                    <button
                        onClick={async () => { closeMobileMenu(); await signOut({ callbackUrl: "/" }); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${isLight ? 'text-red-600 hover:bg-red-50' : 'text-red-400 hover:bg-red-500/10'} ${collapsed ? 'md:justify-center' : ''}`}
                    >
                        <LogOut size={20} className="shrink-0" />
                        <span className={`font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${collapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
                            Sign Out
                        </span>
                    </button>
                </div>
            </aside>
        </>
    )
}