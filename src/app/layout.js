import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title:
    "Rezumix – AI Resume Analyzer, Career Recommendation, Mock Interview Tool & Skill Gap Identifier",
  description:
    "Rezumix is an AI powered career assistance platform built and developed by Devansh Agrawal. It offers resume analysis, skill gap identification, career recommendations and AI driven interview preparation.",
  author: "Devansh Agrawal",
  creator: "Devansh Agrawal",
  keywords:
    "AI Resume Analyzer, Resume Enhancement, Career Recommendations, Personality Prediction, AI Mock Interview, Resume Optimization, Job Application AI, Career Guidance AI, Skill Gap Identifier, RESUMIX, resumix, devansh, devansh agrawal",
  robots: "index, follow",
  openGraph: {
    title:
      "Rezumix – AI Resume Analyzer, Career Recommendation, Mock Interview Tool & Skill Gap Identifier",
    description:
      "An AI-powered career platform to refine resumes, close skill gaps, find your ideal career, and get interview-ready, built for students, professionals, tech and non-tech alike.",
    url: "https://rezumix.in/",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        alt: "Rezumix AI",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const storedTheme = localStorage.getItem('rezumix-theme');
                const theme = storedTheme === 'light' ? 'light' : 'dark';
                const root = document.documentElement;
                root.classList.remove('dark', 'light');
                root.classList.add(theme);
                root.style.colorScheme = theme;
              } catch (error) {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                document.documentElement.style.colorScheme = 'dark';
              }
            })();`,
          }}
        />
        <title>
          Rezumix – AI Resume Analyzer, Career Recommendation, Mock Interview
          Tool & Skill Gap Identifier
        </title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Devansh Agrawal" />
        <meta name="creator" content="Devansh Agrawal" />

        <meta
          name="description"
          content="Rezumix is an AI powered career assistance platform built and developed by Devansh Agrawal. It offers resume analysis, skill gap identification, career recommendations and AI driven interview preparation."
        />

        <meta
          name="keywords"
          content="AI Resume Analyzer, Resume Enhancement, Career Recommendations, Personality Prediction, Mock Interview, Resume Optimization, Job Application AI, Interview Preparation, Career Guidance AI, Skill Gap Identifier, AI Hiring, Job Search AI, RESUMIX, resumix, devansh, devansh agrawal"
        />

        <meta name="robots" content="index, follow" />

        {/* Open Graph tags */}

        <meta
          property="og:title"
          content="Rezumix – AI Resume Analyzer, Career Recommendation, Mock Interview Tool & Skill Gap Identifier"
        />

        <meta
          property="og:description"
          content="Analyze your resume, discover missing skills, get smart career insights, and practice interviews with AI, all in one place."
        />

        <meta property="og:image" content="/og-image.png" />

        <meta property="og:url" content="https://rezumix.in/" />

        <meta property="og:type" content="website" />

        <meta property="og:site_name" content="Rezumix" />

        <link rel="icon" href="/favicon.ico" />

        {/* JSON-LD schema */}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Rezumix",
                applicationCategory: "AI Career Tool",
                description:
                  "Rezumix is an AI powered career assistance platform built and developed by Devansh Agrawal.",
                author: {
                  "@type": "Person",
                  name: "Devansh Agrawal",
                },
                creator: {
                  "@type": "Person",
                  name: "Devansh Agrawal",
                },
                publisher: {
                  "@type": "Person",
                  name: "Devansh Agrawal",
                },
                url: "https://rezumix.in",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Rezumix",
                alternateName: "Rezumix AI",
                url: "https://rezumix.in/",
              },
            ]),
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >

        <SessionWrapper>

          <Toaster
            position="top-right"
            richColors
            closeButton
          />

          <Navbar />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />

        </SessionWrapper>

      </body>
    </html>
  );
}