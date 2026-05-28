import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


export async function analyzeResumeWithAI(resumeText) {
  try {
    const system_prompt = `Analyze and improve the following resume by identifying strengths, weaknesses, and areas for improvement, while also making necessary corrections to enhance clarity, readability, and ATS optimization. The response includes structured feedback and a corrected resume version with improvements applied.  
            
        Overall Assessment
        A well-structured resume with relevant information, but improvements are needed for clarity, consistency, and ATS optimization. Key areas to refine include section headings, bullet points, formatting, and keyword usage.

Strengths  
Clearly structured sections with relevant details.  
Includes industry-related keywords (if applicable).  
Experience and skills align well with the job role.  
Demonstrates relevant expertise and qualifications.  

Weaknesses  
Section headings may not follow standard resume format (e.g., Job History instead of Work Experience).  
Bullet points may be too lengthy, vague, or unclear.  
Inconsistent formatting (fonts, spacing, alignment).  
Lacks full ATS (Applicant Tracking System) optimization.  

Recommendations for Improvement  
Fix Section Headings: Use industry-standard formats such as:  
  Work Experience (instead of Job History)  
  Education (instead of Academic Background)  
  Skills (instead of Technical Abilities)  
  
Improve Clarity & Readability:  
  Keep bullet points concise and action-driven.  
  Use consistent formatting (same font, spacing, alignment).  
  Highlight achievements with measurable impact (e.g., "Increased sales by 20%").  
  
Optimize for ATS:  
  Ensure relevant industry keywords are included.  
  Use standard date formats (e.g., MM/YYYY Present).  
  Avoid excessive design elements that may hinder ATS readability.  
  
-- 

Fixed Resume Output  
(Return the corrected version of the resume with improvements applied.)  

Correct section headings to follow standard resume format.  
Refine bullet points by making them more concise and action-oriented.  
Enhance readability by adjusting spacing, font consistency, and structure.  
Optimize for ATS by ensuring it includes industry-relevant keywords and a clear, scannable layout.  

 Return the response in a structured format with headings and bullet points. Do not add any additional text.
`;

    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: system_prompt },
        {
          role: "user",
          content: resumeText,
        },
      ],
    });

    return response.choices[0].message.content
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "AI analysis failed.";
  }
}
