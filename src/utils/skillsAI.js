import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export async function skillsAI(resumeText, jobRole, jobSkill) {
    try {

        const user_prompt = `You are an expert career counselor and professional recruiter with deep knowledge across both technical and non-technical domains. 
                    You specialize in skill assessment, resume optimization, and career development for ALL types of roles including:
                    - Technical roles (Software Engineers, Data Scientists, DevOps, etc.)
                    - Business roles (Marketing, Sales, Business Analysts, Product Managers, etc.)
                    - Creative roles (Designers, Content Writers, Video Editors, etc.)
                    - Management roles (Project Managers, Team Leads, Operations, etc.)
                    - Administrative roles (HR, Finance, Office Management, etc.)

                    Conduct a comprehensive analysis of the candidate's resume against the job requirements.

                    **Job Role:** ${jobRole}  
                    **Required Skills:** ${JSON.stringify(jobSkill)}  
                    **Candidate Resume:** ${resumeText}

                    **ANALYSIS INSTRUCTIONS:**
                    
                    1. **Deep Skill Mapping:** Don't just match keywords. Analyze based on role type:

                       **For Technical Roles:**
                        - Programming languages, frameworks, tools
                        - Technical project implementations
                        - System design, architecture experience
                        - Problem-solving demonstrations

                       **For Non-Technical Roles:**
                        - Soft skills (communication, leadership, collaboration)
                        - Domain expertise (marketing strategies, sales metrics, design principles)
                        - Business acumen and strategic thinking
                        - Achievements with measurable results (revenue growth, engagement rates, cost savings)
                        
                       **Common for All:**
                        - Direct skill matches (exact matches)
                        - Transferable skills (related/similar competencies)
                        - Demonstrated competencies through work examples
                        - Skill depth indicators (years of experience, impact, scale)
                    
                    2. **Context-Aware Scoring:** Consider:
                        - How critical each skill is for the ${jobRole} role
                        - Whether missing skills are learnable vs. must-haves
                        - Overall experience level alignment
                        - Industry-specific knowledge and domain expertise
                        - For non-technical roles: soft skills, certifications, achievements
                        - For technical roles: technical depth, hands-on experience, problem-solving
                    
                    3. **Practical Gap Analysis:** Identify:
                        - Critical gaps (must-have skills that are missing)
                        - Nice-to-have gaps (beneficial but not essential)
                        - Skills that need strengthening (mentioned but not demonstrated)
                        - For non-technical: soft skill development, certifications, industry knowledge
                        - For technical: technical skills, tools, frameworks, best practices
                    
                    4. **Actionable Recommendations:** Provide role-appropriate advice:

                       **For Technical Roles:**
                        - Online courses (Udemy, Coursera, freeCodeCamp)
                        - Coding projects, GitHub portfolio
                        - Technical certifications (AWS, Azure, Google Cloud, etc.)

                       **For Non-Technical Roles:**
                        - Professional certifications (PMP, Google Analytics, HubSpot, etc.)
                        - Online learning (LinkedIn Learning, Skillshare, Coursera)
                        - Portfolio projects (case studies, campaigns, designs)
                        - Networking and industry events

                       **Common for All:**
                        - Resume improvements to highlight existing skills
                        - Realistic timeline for skill development
                        - Interview preparation strategies

                    **OUTPUT FORMAT:**

                    # Skill Gap Analysis for ${jobRole}
                    
                    Provide a 2-3 sentence executive summary explaining the overall fit, highlighting the strongest alignment areas and most significant gaps.

                    ## Match Score: [X]%
                    
                    **Overall Alignment:** [Brief 1-2 line explanation of the score]
                    
                    **Scoring Breakdown:**
                    - Core Skills Match: [X]% (Technical skills for tech roles / Domain expertise for non-tech roles)
                    - Experience Level Match: [X]%
                    - Soft Skills & Cultural Fit: [X]% (Communication, teamwork, leadership, adaptability)
                    - Industry/Domain Knowledge: [X]%

                    ## ✅ Matched Skills & Strengths
                    
                    List each matched skill with specific evidence from the resume. Adapt format based on role:
                    
                    **For Technical Roles:**
                    - **[Technical Skill/Tool]** - [Implementation details, projects, years of experience]
                    
                    **For Non-Technical Roles:**
                    - **[Skill/Competency]** - [Achievements, metrics, impact examples, certifications]
                    
                    Include 5-8 strongest matches with concrete evidence from the resume.

                    ## ⚠️ Skill Gaps & Areas for Improvement
                    
                    **Critical Gaps** (Essential for the role):
                    - **[Skill Name]** - [Why it's critical] - [Impact on candidacy]
                    
                    **Secondary Gaps** (Nice-to-have):
                    - **[Skill Name]** - [Why it would help] - [Priority level]
                    
                    **Skills Needing Strengthening** (Mentioned but not sufficiently demonstrated):
                    - **[Skill Name]** - [Current level vs. required level] - [What's missing]

                    ## 🎯 Actionable Recommendations
                    
                    **Immediate Actions (0-1 month):**
                    1. [Specific action - For tech: coding challenge/tutorial, For non-tech: online course/certification module]
                    2. [Resume update - Highlight relevant achievements with metrics and impact]
                    3. [Quick skill demonstration - For tech: GitHub project, For non-tech: case study/portfolio piece]
                    
                    **Short-term Development (1-3 months):**
                    1. [Course/Certification - Specific platform and course name]
                        - Tech examples: Udemy, Coursera, freeCodeCamp, Udacity
                        - Non-tech examples: LinkedIn Learning, Google Career Certificates, HubSpot Academy, Coursera
                    2. [Hands-on Project - Role-specific practical application]
                        - Tech: Build an app/tool related to the job requirements
                        - Non-tech: Complete a real-world project/campaign, create portfolio
                    3. [Professional Development - Networking, communities, events]
                    
                    **Long-term Growth (3-6 months):**
                    1. [Advanced Learning Path - Specialization or advanced certification]
                    2. [Experience-building - Freelance, volunteer projects, or contributions]
                        - Tech: Open-source contributions, freelance development
                        - Non-tech: Freelance projects, pro-bono work, side projects
                    3. [Portfolio Development - Showcase work and impact]
                        - Tech: GitHub portfolio, technical blog, project documentation
                        - Non-tech: Personal website, case studies, portfolio site
                    
                    **Resume Optimization Tips:**
                    - [3-5 specific suggestions to better highlight existing relevant skills]
                    - [Keyword optimization recommendations]
                    - [Structure or formatting improvements]

                    ## 💡 Additional Insights
                    
                    - **Competitive Edge:** [Unique strengths or experiences that stand out]
                    - **Application Strategy:** [How to position this application given the gaps]
                    - **Interview Preparation Focus:** [Which skills to emphasize and prepare for]

                    ---
                    
                    **Important Guidelines:**
                    - Be honest but encouraging in your assessment
                    - Provide specific, actionable advice rather than generic suggestions
                    - Include real learning resources when possible (Coursera, Udemy, freeCodeCamp, etc.)
                    - Consider the candidate's current level when recommending next steps
                    - Focus on practical, achievable improvements
                    - Use clear formatting with emojis for better readability
                    `;

        const response = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                {
                    role: "system",
                    content: "You are an expert career advisor and professional recruiter who provides detailed, actionable, and encouraging skill gap analyses for BOTH technical and non-technical roles. You understand the nuances of different industries and job functions. Always be specific with examples and recommendations tailored to the role type. For technical roles, focus on technical depth and hands-on experience. For non-technical roles, emphasize soft skills, achievements, metrics, and business impact."
                },
                {
                    role: "user",
                    content: user_prompt
                }
            ],
            temperature: 0.5,
        });

        return response.choices[0].message.content

    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "AI analysis failed. Please try again.";
    }
}