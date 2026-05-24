"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { Menu, LayoutDashboard, FilePlus, Briefcase, LampDesk, Video, User, User2, FileText, CheckCircle, Scroll, Brain, ClipboardCheck } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from '../../../components/ThemeToggle';

const SIDEBAR_LINKS = [
    { label: "Dashboard", href: "/admindashboard", icon: LayoutDashboard },
    { label: "Resume Analyzer", href: "/admin-resume-analyzer", icon: FilePlus },
    { label: "Career Path", href: "/admin-recommend-career", icon: Briefcase },
    { label: "Skill Gap", href: "/admin-skill-gap", icon: LampDesk },
    { label: "Personality Prediction", href: "/admin-personality-prediction", icon: User },
    { label: "Mock Interview", href: "/admin-mock-interview", icon: Video },
    { label: "My Interviews", href: "/admin-my-interview", icon: Video },
    { label: "All Users", href: "/all-users", icon: User2 },
    { label: "All Resumes", href: "/all-resumes", icon: FileText },
    { label: "All Recommendations", href: "/all-recommendations", icon: CheckCircle },
    { label: "All Mock Interviews", href: "/all-mock-interviews", icon: Scroll },
    { label: "All Skill Gaps", href: "/all-skill-gaps", icon: Brain },
    { label: "All OTPs", href: "/all-otps", icon: ClipboardCheck },
    { label: "Profile", href: "/admin-profile", icon: User2 }
];

export default function AdminSidebar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (status === "loading") return;
        if (!session || status === "unauthenticated") {
            router.replace("/");
        }
        if (session?.user?.role === "admin") {
            router.replace("/admindashboard");
        }
        if(session?.user?.role === "user") {
            router.replace("/dashboard");
        }
    }, [session, status, router]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [mobileOpen]);

    const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

    const userName = useMemo(() => session?.user?.name || "User", [session]);

    if (status === "loading") return null;

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <button onClick={toggleMobileMenu} className="p-2 -ml-2 text-slate-400 hover:text-white">
                        <Menu size={24} />
                    </button>
                    <div className="h-8 w-auto">
                        <Image src="/rezumix_logo.png" width={120} height={32} alt="Rezumix Logo" />
                    </div>
                </div>
                <ThemeToggle />
            </div>
        </>
    );
}