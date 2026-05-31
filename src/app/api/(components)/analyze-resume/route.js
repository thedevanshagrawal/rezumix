import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import mammoth from "mammoth";
import axios from "axios";
import { extractResumeDetails } from "@/utils/extractResumeData";
import { analyzeResumeWithAI } from "@/utils/analyzeResumeWithAI";
import resumeModel from "@/models/resume.model";
import { connectDB } from "@/db/connectDB"
import { GeminiOpenAI } from "@/utils/geminiopenai";
import OpenAI from "openai";
import { requireSession, requireOwnership } from "@/lib/auth-guard";

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { resource_type: "raw", folder: "resumes", format: "docx" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        ).end(buffer);
    });
}

async function downloadFileAsBuffer(fileUrl) {
    try {
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    } catch (error) {
        console.error("Error downloading file:", error);
        return null;
    }
}

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

const system_prompt = `
You are a professional resume analyzer and career advisor with years of experience helping people land great jobs. When analyzing resumes, communicate in a warm, helpful tone like you're personally reviewing each resume for someone you want to see succeed.

Your task is to analyze the user's resume thoroughly and provide actionable feedback that will genuinely help them improve their chances of getting hired.

**Structure your response as follows:**

**ATS Score: [X]%**
Start with an ATS compatibility score and briefly explain what this means for their job search in simple terms.

**Summary of Resume:** 
Provide a brief, encouraging summary of their professional background. Focus on their potential and what makes them a good candidate, while being honest about areas that need work.

**Strengths:**
- Point out what they're doing well in their resume
- Highlight relevant experience, skills, and accomplishments  
- Be specific about what catches your attention positively
- Use encouraging language that builds confidence

**Areas for Improvement:**
- Identify specific issues that are holding their resume back
- Explain why each issue matters for getting past recruiters and ATS systems
- Be constructive rather than critical - frame as opportunities to strengthen their application
- Focus on the most impactful changes they can make

**Recommendations:**
- Give clear, actionable advice they can implement immediately
- Explain the reasoning behind each suggestion so they understand the value
- Prioritize the changes that will have the biggest impact
- Use examples when helpful to illustrate your points

**Enhanced Resume:**
Provide an improved version of their resume with your recommendations applied. Make meaningful improvements to:
- Section headings and organization
- Bullet points for clarity and impact
- Keyword optimization for ATS
- Overall formatting and readability

**Communication Style:**
- Write like you're giving advice to someone you genuinely want to help succeed
- Use "you" and "your" to make it personal
- Be encouraging while being honest about what needs improvement  
- Explain concepts in plain language without jargon
- Show confidence in their ability to improve and land a good job
- Balance professionalism with warmth and approachability
`;

const keyword_prompt = (resumeText) => `
Analyze the following resume text and return a JSON object with exactly 
three keys:

1. "keyword_analysis": an object with:
   - "present": list of strong technical keywords found
   - "missing": list of 3-5 relevant technical keywords absent from the resume
   - "overused": list of weak filler phrases detected

2. "skill_gaps": list of 3-5 skills commonly expected for the role 
   implied by this resume that are missing

3. "improvement_tips": list of 3-5 specific, actionable suggestions 
   ranked by impact

Return only valid JSON. No explanation, no markdown.

Resume text:
${resumeText}
`;

export async function POST(request) {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;
        const { session } = auth;

        await connectDB();

        const { searchParams } = new URL(request.url);
        const fileType = searchParams.get('fileType');

        let extractedText = "";

        if (fileType === "pdf") {
            const { text } = await request.json();

            if (!text || text.trim().length === 0) {
                return NextResponse.json({ error: "Could not extract text from PDF." }, { status: 400 });
            }

            extractedText = text;

            await resumeModel.create({
                resumeUrl: "pdf-upload",
                userEmail: session.user.email
            });

        } else {
            const formData = await request.formData();
            const file = formData.get("file");
            if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult = await uploadToCloudinary(buffer);

            await resumeModel.create({
                resumeUrl: uploadResult.secure_url,
                userEmail: session.user.email
            });

            const downloadedBuffer = await downloadFileAsBuffer(uploadResult.secure_url);
            const { value } = await mammoth.extractRawText({ buffer: downloadedBuffer });
            extractedText = value;
        }

        if (!extractedText || extractedText.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from the file." }, { status: 400 });
        }

        const structuredData = extractResumeDetails(extractedText);

        // Start streaming Gemini call — unchanged from original
        const stream = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "system", content: system_prompt },
                { role: "user", content: extractedText },
            ],
            stream: true
        });

        // Fire keyword analysis in background — does NOT block stream
        // Isolated catch so failure never affects the main analysis stream
        const keywordPromise = openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "user", content: keyword_prompt(extractedText) }
            ],
            stream: false
        }).catch(e => {
            console.error("Keyword analysis failed silently:", e);
            return null;
        });

        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                // Stream main analysis — exactly as before
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                }

                // Main stream done — now resolve keyword result
                const keywordResponse = await keywordPromise;
                if (keywordResponse) {
                    try {
                        const raw = keywordResponse.choices[0].message.content;
                        const clean = raw.replace(/```json|```/g, "").trim();
                        const keywordData = JSON.parse(clean);
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ keyword_data: keywordData })}\n\n`)
                        );
                    } catch (e) {
                        console.error("Keyword JSON parse failed:", e);
                    }
                }

                controller.close();
            }
        });

        return new Response(readable, {
            headers: {
                'Content-Type': "text/event-stream",
                'Cache-Control': "no-cache",
                "Connection": "keep-alive"
            }
        });

    } catch (error) {
        console.log("error: ", error);
        return NextResponse.json({ error: "Error processing file", details: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;
        const { session } = auth;

        const { searchParams } = new URL(req.url);
        const resumeId = searchParams.get("id");

        if (!resumeId) {
            return NextResponse.json({ message: "Resume ID is required" }, { status: 400 });
        }

        await connectDB();
        
        const resume = await resumeModel.findById(resumeId);
        if (!resume) {
            return NextResponse.json({ message: "Resume not found" }, { status: 404 });
        }

        const ownershipCheck = requireOwnership(session, resume.userEmail);
        if (ownershipCheck.error) return ownershipCheck.error;

        await resumeModel.findByIdAndDelete(resumeId);

        return NextResponse.json({ success: true, message: "Resume deleted successfully" }, { status: 200 });
    } catch (error) {
        console.log("error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;
        const { session } = auth;

        await connectDB();

        let query = {};
        if (session.user.role !== "admin") {
            query = { userEmail: session.user.email };
        }

        const resumes = await resumeModel.find(query);

        if (!resumes) {
            return NextResponse.json({ error: "no resume found" }, { status: 400 });
        }

        return NextResponse.json({ message: "resume fetched successfully", resumes }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "error while fetching resume" }, { status: 500 });
    }
}
