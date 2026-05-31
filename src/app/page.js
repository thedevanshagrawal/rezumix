"use client"
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Briefcase,
  Users,
  Mic,
  Crosshair,
  Zap,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useThemeMode } from '@/components/ThemeProvider';

// --- UI Components ---

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    },
  },
};

// 1. Spotlight Card (Interactive Card)
function SpotlightCard({ children, className = "", onClick }) {
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
      onClick={onClick}
      className={`relative overflow-hidden group transition-colors duration-300 ${isDark ? "border border-white/10 bg-neutral-900/80" : "border border-slate-200 bg-white shadow-lg shadow-slate-200/40"} ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full z-10">{children}</div>
    </div>
  );
}

// 2. Fixed Background (Z-Index 0 to stay behind) - Responsive
const GridBackground = () => {
  const { theme } = useThemeMode();
  const isDark = theme === "dark";

  return (
    <div className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-300 ${isDark ? "bg-[#050505]" : "bg-slate-50"}`}>
      <div className={`absolute inset-0 bg-[size:20px_20px] sm:bg-[size:24px_24px] md:bg-[size:32px_32px] ${isDark ? "bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" : "bg-[linear-gradient(to_right,#cbd5e11f_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e11f_1px,transparent_1px)]"}`} />
      <div className={`absolute top-0 left-0 w-full h-[40vh] sm:h-[50vh] md:h-[60vh] blur-[60px] sm:blur-[90px] md:blur-[120px] rounded-full mix-blend-screen ${isDark ? "bg-blue-600/10" : "bg-sky-500/15"}`} />
      <div className={`absolute bottom-0 right-0 w-full h-[40vh] sm:h-[50vh] md:h-[60vh] blur-[60px] sm:blur-[90px] md:blur-[120px] rounded-full mix-blend-screen ${isDark ? "bg-purple-600/5" : "bg-indigo-500/10"}`} />
    </div>
  );
};

// --- Content Data (Simplified & SEO Friendly) ---

const features = [
  {
    title: "Check My Resume",
    desc: "Is your resume getting rejected? Our AI scans it like a recruiter and tells you exactly what to fix in seconds.",
    icon: FileText,
    tags: [
      { text: "Fix Errors", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
      { text: "Beat the Bot", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    ],
    colSpan: "md:col-span-2",
    gradient: "from-blue-500/20 to-blue-500/0"
  },
  {
    title: "Interview Practice",
    desc: "Nervous about interviews? Practice with our AI voice coach. It asks real questions and gives you feedback.",
    icon: Mic,
    tags: [
      { text: "Voice Mode", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
      { text: "Instant Feedback", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    ],
    colSpan: "md:col-span-1",
    gradient: "from-emerald-500/20 to-emerald-500/0"
  },
  {
    title: "Career Path",
    desc: "Confused about your future? We analyze your skills and suggest high-paying jobs you are good at.",
    icon: Briefcase,
    tags: [
      { text: "Find Jobs", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
      { text: "Salary Check", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    ],
    colSpan: "md:col-span-1",
    gradient: "from-purple-500/20 to-purple-500/0"
  },
  {
    title: "Work Personality",
    desc: "Are you a leader or a creator? Find out your work style and which companies suit you best.",
    icon: Users,
    tags: [
      { text: "Psychology", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
      { text: "Culture Fit", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    ],
    colSpan: "md:col-span-1",
    gradient: "from-pink-500/20 to-pink-500/0"
  },
  {
    title: "Skill Gaps",
    desc: "Want a promotion? See exactly which skills you are missing for that Senior role.",
    icon: Crosshair,
    tags: [
      { text: "Learn New Skills", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
      { text: "Grow Fast", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
    ],
    colSpan: "md:col-span-1",
    gradient: "from-orange-500/20 to-orange-500/0"
  },
];

const stats = [
  { val: "50k+", label: "Resumes Fixed" },
  { val: "95%", label: "Success Rate" },
  { val: "24/7", label: "Always Online" },
  { val: "4.9★", label: "User Rating" },
];

const faqs = [
  // { q: "Is this free?", a: "Yes! You can scan your resume and get basic feedback for free. We also have a Pro plan for unlimited deep analysis." },
  { q: "How is this better than ChatGPT?", a: "ChatGPT writes generic text. Rezumix is a specialized engine trained on real hiring data. We don't just write; we score and validate your resume against job descriptions." },
  { q: "Is my data safe?", a: "100% Secure. Your resume is never sold to anyone." },
  { q: "Does it work for non-tech jobs?", a: "Yes. It works for Marketing, Sales, Finance, Healthcare, and Teaching roles too." },
];

const testimonials = [
  { quote: "I applied to 50 jobs with no luck. After fixing my resume keywords with Rezumix, I got 3 interview calls in one week.", author: "Sarah J." },
  { quote: "The AI interview mock was scary accurate. It asked me the exact question my actual interviewer asked the next day!", author: "David C." },
  { quote: "I didn't know I was qualified for Senior roles until the Career Path tool showed me. I just got a 40% salary hike.", author: "Mike R." },
];

// --- Main Page Component ---

const Home = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme } = useThemeMode();
  const isDark = theme === "dark";

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [router, session]);

  return (
    // Added overflow-x-hidden to prevent horizontal scroll issues on mobile
    <div className={`relative min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${isDark ? "bg-[#050505] text-slate-200 selection:bg-blue-500/30" : "bg-slate-50 text-slate-900 selection:bg-sky-500/25"}`}>

      {/* Background is Z-0, content will be Z-10 */}
      <GridBackground />

      {/* 1. HERO SECTION (Split Layout: Text Left, Visual Right) */}
      <section className="relative z-10 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">

          {/* LEFT COLUMN: Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-4 sm:mb-5 md:mb-6 leading-[1.1]"
            >
              Your Resume is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Losing You Money.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-slate-400 max-w-xl mb-6 sm:mb-7 md:mb-8 leading-relaxed"
            >
              Stop guessing. Rezumix uses AI to fix your resume errors,
              prepare you for interviews, and help you get hired faster.
            </motion.p>

            {/* Hero Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mb-8 sm:mb-10 md:mb-12"
            >
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] cursor-pointer text-sm sm:text-base touch-manipulation">
                  Fix My Resume Free <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/rezumix.apk" className="w-full sm:w-auto ">
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 text-white border border-white/10 font-medium rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer text-sm sm:text-base touch-manipulation">
                  Download Rezumix App
                </button>
              </Link>
            </motion.div>

            {/* Stats (Left Aligned now) */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 border-t border-white/5 pt-6 sm:pt-7 md:pt-8 w-full max-w-md">
              {stats.slice(0, 3).map((s, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{s.val}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Animated SVG Radar */}
          <div className="relative h-[280px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] w-full flex items-center justify-center lg:justify-end perspective-1000">
            {/* The SVG Container */}
            <div className="relative w-[280px] sm:w-[320px] md:w-[380px] lg:w-[450px] xl:w-[500px] aspect-square">
              {/* Glow Effect behind SVG */}
              <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full" />

              <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Outer Tech Ring (Rotating) */}
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  style={{ originX: "100px", originY: "100px" }}
                >
                  <circle cx="100" cy="100" r="80" stroke="#1e293b" strokeWidth="1" fill="none" />
                  <circle cx="100" cy="100" r="80" stroke="#3b82f6" strokeWidth="2" strokeDasharray="20 160" strokeLinecap="round" />
                </motion.g>

                {/* Inner Tech Ring (Counter-Rotating) */}
                <motion.g
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ originX: "100px", originY: "100px" }}
                >
                  <circle cx="100" cy="100" r="60" stroke="#1e293b" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                  <path d="M100 40 L100 60 M100 140 L100 160 M40 100 L60 100 M140 100 L160 100" stroke="#3b82f6" strokeWidth="2" />
                </motion.g>

                {/* Central Resume Icon / Scan Target */}
                <g transform="translate(75, 70)">
                  <rect x="10" y="5" width="30" height="40" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                  <line x1="15" y1="15" x2="35" y2="15" stroke="#475569" strokeWidth="1" />
                  <line x1="15" y1="20" x2="35" y2="20" stroke="#475569" strokeWidth="1" />
                  <line x1="15" y1="25" x2="25" y2="25" stroke="#475569" strokeWidth="1" />

                  {/* Scanning Beam */}
                  <motion.rect
                    x="0" y="0" width="50" height="10"
                    fill="url(#scanGradient)"
                    animate={{ y: [0, 60, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </g>

                {/* Floating Elements (Analysis Tags) */}
                <motion.g animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <rect x="140" y="80" width="40" height="14" rx="4" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="0.5" />
                  <text x="160" y="90" fontSize="6" fill="#60a5fa" textAnchor="middle">98% Match</text>
                </motion.g>

                <motion.g animate={{ y: [5, -5, 5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
                  <rect x="20" y="120" width="50" height="14" rx="4" fill="#ef4444" fillOpacity="0.1" stroke="#ef4444" strokeWidth="0.5" />
                  <text x="45" y="130" fontSize="6" fill="#f87171" textAnchor="middle">Keyword Missing</text>
                </motion.g>

              </svg>
            </div>
          </div>

        </div>
      </section>


      {/* 2. FEATURES SECTION */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-20 text-center md:text-left">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Everything You Need</h2>
            <p className={`${isDark ? "text-slate-400" : "text-slate-600"} text-base sm:text-lg`}>From application to offer letter, we got you covered.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 auto-rows-[minmax(220px,auto)] sm:auto-rows-[minmax(240px,auto)] md:auto-rows-[minmax(250px,auto)]"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
              <motion.div key={idx} variants={fadeUp}>
                <SpotlightCard
                  className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between ${feature.colSpan}`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br ${feature.gradient} blur-[40px] sm:blur-[50px] md:blur-[60px] opacity-50`} />

                  <div className="relative z-10">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 text-white">
                      <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" />
                    </div>

                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-2.5 md:mb-3">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 relative z-10 mt-auto">
                    {feature.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`text-[10px] sm:text-xs font-medium px-3 py-1 rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-105 ${tag.color}`}
                      >
                        {tag.text}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section >


      {/* 3. HOW IT WORKS */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className={`relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-y ${isDark ? "bg-neutral-900/30 border-white/5" : "bg-white/70 border-slate-200"}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">How It Works</h2>
            <p className="text-slate-400 text-sm sm:text-base">3 simple steps to your dream job.</p>
          </div>

          <div className="space-y-8 sm:space-y-10 md:space-y-12 relative">
            {/* Desktop Connector Line */}
            <div className="absolute left-5 sm:left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 to-purple-500/50 hidden sm:block" />

            {[
              { title: "Upload Resume", desc: "Drag and drop your PDF. Our system is secure and private.", icon: Zap },
              { title: "AI Analysis", desc: "Our engine checks 50+ points (Formatting, Keywords, Grammar).", icon: ShieldCheck },
              { title: "Get Hired", desc: "Follow our step-by-step checklist to fix errors and apply.", icon: CheckCircle2 }
            ].map((step, i) => {
              const Icon = step.icon;
              return (
              <div key={i} className="flex gap-4 sm:gap-6 md:gap-10 relative">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center z-10 relative shadow-xl">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
                <div className="pt-1 sm:pt-2 flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{step.desc}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </motion.section >


      {/* 4. FAQ SECTION */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 sm:mb-10 text-center">Questions?</h2>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((item, i) => (
              <div key={i} className={`${isDark ? "bg-[#0A0A0A] border border-white/5" : "bg-white border border-slate-200 shadow-sm"} rounded-xl sm:rounded-2xl overflow-hidden`}>
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex justify-between items-center p-4 sm:p-5 md:p-6 text-left focus:outline-none hover:bg-white/5 transition-colors touch-manipulation"
                >
                  <span className="font-medium text-slate-200 text-sm sm:text-base md:text-lg pr-4">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform duration-300 flex-shrink-0 ${openFaqIndex === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openFaqIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-0 text-slate-400 leading-relaxed border-t border-white/5 mt-2 text-sm sm:text-base">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.section >

      {/* 5. SUCCESS STORIES (Fixed Visibility) */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className={`relative z-10 py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 border-t ${isDark ? "border-white/5 bg-[#080808]" : "border-slate-200 bg-white/80"}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
              Real Results. <span className="text-blue-400">Real Jobs.</span>
            </h2>
            <p className={`${isDark ? "text-slate-400" : "text-slate-600"} max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4`}>
              Join thousands of professionals who stopped guessing and started getting hired.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className={`${isDark ? "bg-neutral-900/50 border border-white/10" : "bg-white border border-slate-200 shadow-lg shadow-slate-200/40"} p-5 sm:p-6 md:p-7 lg:p-8 rounded-2xl sm:rounded-3xl relative hover:border-white/20 transition-colors`}>
                <p className={`${isDark ? "text-slate-200" : "text-slate-700"} mb-4 sm:mb-5 md:mb-6 leading-relaxed font-medium text-sm sm:text-base`}>{t.quote}</p>
                <div className={`flex items-center gap-3 sm:gap-4 mt-auto pt-3 sm:pt-4 ${isDark ? "border-t border-white/5" : "border-t border-slate-200"}`}>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                    {t.author[0]}
                  </div>
                  <div className="min-w-0">
                    <div className={`${isDark ? "text-white" : "text-slate-900"} font-bold text-sm truncate`}>{t.author}</div>
                    <div className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 sm:mt-16 md:mt-20 text-center px-4">
            <Link href="/login">
              <button className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-black font-bold text-base sm:text-lg rounded-xl hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] cursor-pointer touch-manipulation">
                Start Your Success Story
              </button>
            </Link>
          </div>
        </div>
      </motion.section >

    </div >
  );
};

export default Home;