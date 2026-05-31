import { PersonalityWithGemini } from "@/utils/PersonalityWithGemini"
import { NextResponse } from "next/server"
import OpenAI from "openai";
import { requireSession } from "@/lib/auth-guard";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export async function POST(req) {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;

        const { answers, name } = await req.json()

        if (!answers) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 })
        }

        const system_prompt = `Analyze the following personality questionnaire responses and predict the user's personality traits based on the Big Five model. Provide a brief summary with insights and recommendations, keeping the response concise with bullet points.

                User: ${name}
                Responses: ${JSON.stringify(answers)}

                Format:
                # Personality Overview
                (Brief summary of ${name}'s personality.)

                ## Strengths
                - Bullet point 1
                - Bullet point 2

                ## Areas of Improvement
                - Bullet point 1
                - Bullet point 2

                ## Career Recommendations
                - Bullet point 1
                - Bullet point 2
                `;

        const stream = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "user", content: system_prompt },
            ],
            stream: true
        });

        const encoder = new TextEncoder()

        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || ""
                    if (content) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })} \n\n`))
                    }
                }
                controller.close()
            }
        })

        return new Response(readable, {
            headers: {
                'Content-Type': "text/event-stream",
                'Cache-Control': "no-cache",
                "Connection": "keep-alive"
            }
        })
    } catch (error) {
        console.log("error: ", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}