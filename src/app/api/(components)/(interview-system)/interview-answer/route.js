import { InterviewAnswer } from "@/utils/InterviewAnswer";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";

export async function POST(req) {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;

        const { userAnswer, question } = await req.json();

        const geminiResponseRaw = await InterviewAnswer(userAnswer, question);

        // Remove backticks, code blocks, and parse
        const clean = geminiResponseRaw.replace(/```(json|javascript)?\n?/g, "").replace(/```$/, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(clean);
        } catch (error) {
            console.error("Failed to parse Gemini response:", error);
            return NextResponse.json({ message: "Malformed Gemini response", error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "answer checked successfully", geminiResponse: parsed }, { status: 200 });

    } catch (error) {
        console.log("error: ", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
