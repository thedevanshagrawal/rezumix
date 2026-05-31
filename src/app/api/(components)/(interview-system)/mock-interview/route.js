import { connectDB } from "@/db/connectDB"
import mockInterviewModel from "@/models/mockInterview.model"
import { MockGemini } from "@/utils/mockGemini"
import { NextResponse } from "next/server"
import { requireSession } from "@/lib/auth-guard";


export async function POST(req) {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;
        const { session } = auth;

        const { jobRole, jobDescription, experience, techStack } = await req.json()

        if (!jobRole || !jobDescription || !experience || !techStack) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 })
        }

        let geminiResponseRaw = await MockGemini(jobRole, jobDescription, experience, techStack);

        if (!geminiResponseRaw || typeof geminiResponseRaw !== 'string') {
            return NextResponse.json({ message: "Error in Gemini Response" }, { status: 400 })
        }

        // Improved cleaning logic
        geminiResponseRaw = geminiResponseRaw
            .replace(/^json\s*/i, "")           // Remove "json" prefix
            .replace(/```json/gi, "")           // Remove ```json
            .replace(/```/g, "")                // Remove any remaining backticks
            .replace(/^[^{]*({.*})[^}]*$/s, '$1') // Extract only the JSON object part
            .trim();

        let geminiResponse;
        try {
            geminiResponse = JSON.parse(geminiResponseRaw);
        } catch (parseError) {
            console.log("JSON Parse Error: ", parseError);
            console.log("Raw response: ", geminiResponseRaw);
            return NextResponse.json({
                message: "Invalid JSON response from AI",
                error: parseError.message
            }, { status: 400 });
        }

        await connectDB()

        const saveDB = await mockInterviewModel.create({
            jobRole,
            jobDescription,
            experience,
            techStack,
            geminiResponse,
            userEmail: session.user.email
        })

        if (!saveDB) {
            return NextResponse.json({ message: "Error while saving in DB" }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: "Mock Interview created successfully",
            geminiResponse
        }, { status: 200 })

    } catch (error) {
        console.log("error: ", error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })
    }
}

export async function GET(req) {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;
        const { session } = auth;

        await connectDB()

        const response = await mockInterviewModel.find({ userEmail: session.user.email })

        if (!response) {
            return NextResponse.json({ message: "No data is available" }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: "Mock Interview fetched successfully",
            data: response
        }, { status: 200 })

    } catch (error) {
        console.log("error: ", error)
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 })
    }
}