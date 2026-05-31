import { connectDB } from "@/db/connectDB"
import { skillsAI } from "@/utils/skillsAI";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractResumeDetails } from "@/utils/extractResumeData";
import skillGapModel from "@/models/skillGap.model";
import OpenAI from "openai";
import { requireSession } from "@/lib/auth-guard";

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

export async function POST(req) {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;
        const { session } = auth;

        await connectDB();

        const { searchParams } = new URL(req.url);
        const fileType = searchParams.get('fileType'); // ✅ "pdf" ya "docx"

        let resumeText = "";
        let jobRole = "";
        let jobSkill = "";

        if (fileType === "pdf") {
            // ✅ PDF — frontend se text + job data JSON mein aayega
            const body = await req.json();
            resumeText = body.text;
            jobRole = body.jobRole;
            jobSkill = body.jobSkill;

            if (!resumeText || resumeText.trim().length === 0) {
                return NextResponse.json({ error: "Could not extract text from PDF." }, { status: 400 });
            }

            await skillGapModel.create({
                resumeUrl: "pdf-upload",
                jobRole,
                jobSkill,
                userEmail: session.user.email
            });

        } else {
            // ✅ DOCX — original flow same
            const formData = await req.formData();
            const file = formData.get("file");
            jobRole = formData.get("jobRole");
            jobSkill = formData.get("jobSkill");

            if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadResult = await uploadToCloudinary(buffer);

            const downloadedBuffer = await downloadFileAsBuffer(uploadResult.secure_url);
            const { value } = await mammoth.extractRawText({ buffer: downloadedBuffer });
            resumeText = value;

            await skillGapModel.create({
                resumeUrl: uploadResult.secure_url,
                jobRole,
                jobSkill,
                userEmail: session.user.email
            });
        }

        if (!resumeText || resumeText.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from the file." }, { status: 400 });
        }

        const structuredData = extractResumeDetails(resumeText);

        const system_prompt = `Analyze the following user resume, job role, and required job skills.  
                    Your task is to identify skill matches, gaps, and provide a match score (0-100%) indicating how well the resume aligns with the job role's required skills.  

                    Job Role: ${jobRole}  
                    Required Skills: ${JSON.stringify(jobSkill)}  
                    Resume Text: ${resumeText}

                    Format your response as follows:

                    # Skill Gap Analysis  
                    Provide a brief summary of how well the resume matches the required skills for the job role, including the match score as a percentage.

                    ## Match Score  
                    - Provide a numerical score (0-100%) representing the overall skill match between the resume and the job requirements.

                    ## Matched Skills  
                    - List key skills and experiences from the resume that align well with the job requirements.

                    ## Skill Gaps  
                    - List important skills or experiences missing or weak in the resume compared to the job requirements.

                    ## Recommendations  
                    - Provide actionable recommendations to fill the skill gaps, improve the resume, and increase the match score.

                    Return the response in a clear, structured format with bullet points under each heading. Do not include any extra commentary.
                    `;

        const stream = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "user", content: system_prompt },
            ],
            stream: true
        });

        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })} \n\n`));
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

        const skillGaps = await skillGapModel.find(query).lean();

        if (!skillGaps) {
            return NextResponse.json({ error: "skill gap record not found" }, { status: 400 });
        }

        return NextResponse.json({ message: "skill gaps record fetched successfully", skillGaps }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "error while fetching skill gaps record" }, { status: 500 });
    }
}