# 🚀 Rezumix – AI-Powered Resume & Personality Analyzer

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-AI-blue?style=flat-square&logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Rezumix** is a sophisticated full-stack AI application designed to bridge the gap between technical qualifications and psychological soft skills. By analyzing a user's resume and behavioral questionnaire responses, Rezumix leverages **Google's Gemini API** to predict personality traits using the industry-standard **OCEAN (Big Five) personality model**. It empowers users with deep psychological insights, personalized career trajectories, and targeted skill recommendations.

---

## 📌 Table of Contents

- [📦 Key Features](#-key-features)
- [🏗️ System Architecture & Logic](#️-system-architecture--logic)
- [🗂️ Project Structure](#️-project-structure)
- [⚙️ Getting Started](#️-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation Guide](#installation-guide)
  - [Environment Configuration](#environment-configuration)
- [🔌 API Routes Overview](#-api-routes-overview-appapi)
  - [Auth Routes](#-auth-routes)
  - [Resume analysis](#-resume-analysis)
  - [Questionnaire Routes](#-questionnaire-routes)
  - [Personality Report](#-personality-report)
- [🔐 Authentication & Security](#-authentication--security)
- [🤖 Sample Gemini Prompt](#-sample-gemini-prompt)
- [📈 Future Roadmap](#-future-roadmap)
- [🤝 Contributing Guide](#-contributing-guide)
- [👤 Author](#-author)
- [📄 License](#-license)

---

## 📦 Key Features

*   **📄 Dual-Engine Analysis:** Extract text directly from uploaded PDFs or process psychological data through native questionnaire tracking.
*   **🧠 AI-Powered OCEAN Profiling:** Deep evaluation across Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism utilizing custom engineering on Google Gemini.
*   **📊 Dynamic Visual Dashboards:** Rich, interactive charts and modern reporting modules built with Tailwind CSS and animated using Framer Motion.
*   **🧭 Actionable Career Roadmaps:** Algorithmic-like tailored tracking mapping personality profiles to realistic job domains and required skillsets.
*   **🔐 Bulletproof Authentication:** Secure registration and stateful user management via JWT parameters encrypted in HTTP-only cookies.

---

## 🏗️ System Architecture & Logic

### Resume-Based Analysis Pipeline
1. **Upload:** User provides an engineering/corporate resume (PDF formatted directly to base64 encoding).
2. **Parsing:** System strips raw text and feeds it alongside structured, localized prompts to the LLM core.
3. **Inference:** Gemini evaluates semantic phrasing to output structured decimal profiles ($0.0 - 1.0$) matching the Big Five spectrum.
4. **Persistence:** Complete datasets are structured in Mongoose models and reflected instantaneously on the frontend graphs.

### Questionnaire-Based Narrative Pipeline
1. **Behavioral Prompts:** Users interact with an $8\text{--}10$ question deep-dive testing soft metrics and situational judgment.
2. **Narrative Construction:** Submissions compose an encrypted user-intent prompt evaluated contextually by Gemini.
3. **Insight Dispatch:** The engine outputs raw personality metrics coupled with tailored career vectors, saved automatically to the relational MongoDB clusters.

---

## 🗂️ Project Structure

```text
rezumix/
├── app/
│   ├── layout.js                 # App layout wrapper
│   ├── page.js                   # Landing/home page
│   ├── dashboard/                # Authenticated user dashboard
│   ├── upload/                   # Resume upload and handling
│   ├── questionnaire/            # Personality test interface
│   ├── result/                   # Personality report and insights
│   └── api/                      # Next.js App Router API Engines
│       ├── auth/                 # JWT login/register routines
│       ├── resume/               # File parsers and text extraction
│       ├── questionnaire/        # Dynamic test handlers
│       └── personality/          # Aggregation modules and tips
├── components/                   # Reusable UI/UX Elements
├── lib/
│   ├── db.js                     # MongoDB connection utility
│   ├── gemini.js                 # Gemini API integration wrapper
│   └── utils.js                  # Token generation, validation, etc.
├── models/
│   ├── User.js                   # Mongoose user model
│   ├── Report.js                 # Mongoose personality analytics model
│   └── Questionnaire.js          # Mongoose questionnaire tracking model
├── public/                       # Static media, icons, and assets
├── styles/                       # Global Tailwind and structural CSS
├── .env.local                    # Local environment variables
└── next.config.js                # Core Next.js compilation options

```

---

## ⚙️ Getting Started

### Prerequisites

Before running the application, make sure you have the following installed locally:

* [Node.js](https://nodejs.org/) (v18.x or later recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* A running instance of [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Installation Guide

1. **Clone the Repo:**
```bash
git clone [https://github.com/thedevanshagrawal/rezumix.git](https://github.com/thedevanshagrawal/rezumix.git)
cd rezumix

```


2. **Install Dependencies:**
```bash
npm install

```



### Environment Configuration

Copy `.env.example` to `.env.local` and fill in the values:

```env
MONGODB_URI=your_mongodb_connection_string

# NextAuth.js (generate a secret with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth 2.0 ("Continue with Google")
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
GEMINI_API_KEY=your_google_gemini_api_key

```

#### Setting up Google OAuth (for "Continue with Google")

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create (or select) a project, then **Create Credentials → OAuth client ID**.
3. Choose **Web application** as the application type.
4. Add the following **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
5. Copy the generated **Client ID** and **Client secret** into `GOOGLE_CLIENT_ID`
   and `GOOGLE_CLIENT_SECRET` in your `.env.local`.

The secret is only ever read server-side via `process.env` and is never exposed
to the browser.

### Running Locally

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) inside your browser to view the app.

---

## 🔌 API Routes Overview (`/app/api/`)

### 🔐 Auth Routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new user profile |
| `POST` | `/api/auth/login` | Authenticate credentials and drop an HTTP-only JWT |

### 📄 Resume Analysis

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/resume/upload` | Validates and saves base64 PDF strings |
| `POST` | `/api/resume/analyze` | Passes structural text blocks to Gemini for score generation |

### 🧠 Questionnaire Routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/questionnaire/sample` | Fetches randomized behavioral prompts generated by the AI |
| `POST` | `/api/questionnaire/submit` | Submits targeted user solutions directly to evaluation engines |

### 📊 Personality Report

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/personality/report` | Serves finalized profile metrics and dashboard data |
| `GET` | `/api/personality/tips` | Distributes dynamic growth advice parsed by the AI |

---

## 🔐 Authentication & Security

* **Secure Cookies:** Session tokens are minted using **JSON Web Tokens (JWT)** and locked strictly inside `HTTP-only` and `SameSite` cookie definitions to mitigate XSS risks.
* **Password Hashing:** Standard plain-text password objects undergo salt rounds and processing via `bcrypt` hooks before database insertion.
* **Route Guards:** Next.js middleware layers inspect incoming dynamic tokens to prevent unauthorized route access to analytical modules.

---

## 🤖 Sample Gemini Prompt

```text
Analyze the following resume content and predict the user's Big Five (OCEAN) personality traits.

Resume:
"Full-stack developer with 3 years of experience in building scalable systems. Passionate about collaboration and solving real-world problems..."

Instructions:
- Return trait values (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) as decimal scores (0.0 - 1.0).
- Explain each trait in one line.
- Suggest 3 career paths and 3 skills to develop.

Format:
{
  "Openness": 0.83,
  "Conscientiousness": 0.78,
  ...
}

```

---

## 📈 Future Roadmap

* 🎙️ **Voice Integration:** Speech-to-text processing for dynamic oral questionnaire submissions.
* 💬 **Emotional Memory Hub:** Contextual conversational AI tracking long-term testing trends.
* 🧑‍🎨 **Interactive Avatars:** Framer Motion animated elements processing user analytical outcomes in real-time.
* 📥 **Report Exports:** Native compiled PDF downloads for direct sharing with recruiters.

---

## Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

## 🤝 Contributing Guide

Contributions make the open-source community an amazing place to learn, inspire and create. Any contributions you make are **greatly appreciated**. 
- View: [CONTRIBUTING.md](CONTRIBUTING.md)

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👤 Author

**Devansh Agrawal**

🎓 B.Tech CSE, The ICFAI University, Raipur  
🧠 Full Stack & AI Developer  
🔗 [LinkedIn](https://www.linkedin.com/in/thedevanshagrawal/)  
💻 [GitHub](https://github.com/thedevanshagrawal)  
📧 Email: agrawaldevansh27@gmail.com  

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

> _“Your personality. Your potential. Rezumix.”_