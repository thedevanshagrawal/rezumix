"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useThemeMode } from "./ThemeProvider";

const Navbar = () => {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { theme, mounted, toggleTheme } = useThemeMode();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && !event.target.closest("nav")) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [menuOpen]);

    const navItems = [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" }
    ];

    const dropdownItems = [
        { name: "Resume Analyzer", href: "/login", description: "Fix errors & beat ATS bots" },
        { name: "Resume Builder", href: "/login", description: "Build a standout resume" },
        { name: "Career Path", href: "/login", description: "Find high-paying roles" },
        { name: "Personality Fit", href: "/login", description: "Discover your work style" },
        { name: "Mock Interview", href: "/login", description: "AI Voice practice" },
        { name: "Skill Gaps", href: "/login", description: "Upskill for promotions" }
    ];

    if (session) {
        return;
    }

    const isDark = theme === "dark";
    const navShellClass = scrolled
        ? isDark
            ? "bg-[#050505]/80 backdrop-blur-md border-b border-white/5 py-3"
            : "bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-sm"
        : "bg-transparent py-5";

    const navTextClass = isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900";
    const panelClass = isDark
        ? "bg-[#0A0A0A] border border-white/10"
        : "bg-white border border-slate-200 shadow-2xl shadow-slate-200/40";
    const overlayClass = isDark ? "bg-[#050505]" : "bg-slate-50";

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full z-[60] transition-all duration-300 ${navShellClass}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

                    {/* Logo */}
                    <Link href="/" className="relative z-50">
                        <Image src={'/rezumix_logo.png'} alt='Rezumix' width={180} height={40} className="w-32 md:w-40 h-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">

                        {!session && (
                            <div className={`flex items-center gap-1 rounded-full px-4 py-1.5 backdrop-blur-sm ${isDark ? "bg-white/5 border border-white/5" : "bg-white/75 border border-slate-200/80 shadow-sm"}`}>
                                {/* Features Dropdown */}
                                <NavigationMenu>
                                    <NavigationMenuList>
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger className={`text-sm font-medium bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent transition-colors flex items-center gap-1 ${navTextClass}`}>
                                                Features
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <div className={`w-[300px] p-2 rounded-xl shadow-2xl backdrop-blur-xl ${panelClass}`}>
                                                    {dropdownItems.map((item) => (
                                                        <NavigationMenuLink key={item.name} asChild>
                                                            <Link
                                                                href={item.href}
                                                                className="block p-3 rounded-lg hover:bg-white/5 transition-colors group"
                                                            >
                                                                <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                                                                    {item.name}
                                                                </div>
                                                                <div className="text-xs text-slate-500 group-hover:text-slate-400">
                                                                    {item.description}
                                                                </div>
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    ))}
                                                </div>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    </NavigationMenuList>
                                </NavigationMenu>

                                {/* Standard Links */}
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`text-sm font-medium transition-colors px-3 py-1 ${pathname === item.href ? (isDark ? "text-white" : "text-slate-900") : navTextClass
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className={`h-10 w-10 rounded-full border transition-colors flex items-center justify-center ${isDark ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}
                                aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {mounted && isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>

                            {session ? (
                                <button
                                    onClick={() => signOut()}
                                    className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4"
                                    >
                                        Login
                                    </Link>
                                    <Link href="/register">
                                        <button className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                                            Get Started
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`md:hidden p-2 transition-colors z-50 ${isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
                    >
                        {menuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}

            </nav>
            <div className={`md:hidden fixed inset-0 z-40 transition-transform duration-300 pt-24 px-6 ${overlayClass} ${menuOpen ? "translate-x-0" : "translate-x-full"
                }`}>
                <div className="flex flex-col gap-6">
                    {/* Features List for Mobile */}
                    <div className="space-y-4 pb-6 border-b border-white/10">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform</p>
                        {dropdownItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="block"
                            >
                                <div className="text-lg font-medium text-slate-200">{item.name}</div>
                                <div className="text-sm text-slate-500">{item.description}</div>
                            </Link>
                        ))}
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                className="block text-lg font-medium text-slate-300 hover:text-white"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Auth */}
                    <div className="pt-6 mt-auto">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`mb-4 w-full py-3 rounded-xl border font-medium flex items-center justify-center gap-2 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            {isDark ? "Light mode" : "Dark mode"}
                        </button>

                        {session ? (
                            <button
                                onClick={() => signOut()}
                                className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 font-medium"
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link href="/register" onClick={() => setMenuOpen(false)}>
                                    <button className="w-full py-3 bg-white text-black font-bold rounded-xl">
                                        Get Started Free
                                    </button>
                                </Link>
                                <Link href="/login" onClick={() => setMenuOpen(false)}>
                                    <button className="w-full py-3 text-slate-300 font-medium">
                                        Log In
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;