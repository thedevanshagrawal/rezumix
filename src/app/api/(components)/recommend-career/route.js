import { NextResponse } from "next/server";
import { connectDB } from "@/db/connectDB"
import recommendModel from "@/models/recommend.model";
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
        const { session } = auth;

        const getData = await req.json();

        const userData = getData.formData

        if (!userData) {
            return NextResponse.json(
                { error: "User Data is required" },
                { status: 400 }
            );
        }

        await connectDB()

        await recommendModel.create({
            recommendUserName: userData.userFullName,
            userEmail: session.user.email,
            skills: userData.skills,
            interests: userData.interests,
            preferredWorkEnvironment: userData.preferredWorkEnvironment,
            timeCommitment: userData.timeCommitment
        })

        const system_prompt = `
                Hey there! I'm here as someone who genuinely cares about helping you find work that doesn't just pay the bills, but actually feels right for who you are. Think of me as that friend who's been around the block, knows what's actually happening in today's job market, and wants to see you succeed without burning out.

                I'm going to be real with you - no fancy job titles that sound impressive but don't exist in the real world. Instead, I'll focus on opportunities that are actually hiring right now, paths that make sense with your current skills, and realistic next steps you can take starting today.

                ---

                ## About You:
                - Your skills: ${userData.skills.join(", ")}
                - What interests you: ${userData.interests.join(", ")}
                - How you like to work: ${userData.preferredWorkEnvironment}
                - Time you can commit: ${userData.timeCommitment} hours per week

                ---

                ## How I'll Help You:

                I'm going to talk to you like we're having coffee, not like I'm reading from some career handbook. Here's what I'll focus on:

                **Real opportunities** - Jobs that companies are actually posting and hiring for in 2024-2025
                **Your current skills** - How to leverage what you already know without needing 3 years of extra training  
                **Market demand** - What's hot right now and what pays well
                **Practical steps** - What you can literally start doing next week, not someday in the future
                **Different ways to work** - Full-time jobs, freelancing, contract work, remote opportunities
                **Growth paths** - How each option can lead to better opportunities down the road

                I'll suggest 3-5 solid directions (not 10 random ideas) that actually make sense for someone with your background.

                ---

                ## Here's What I Think Could Work for You:

                ### **Option 1: [Realistic Role/Path]**  
                **Why this makes sense:** [Connect their actual skills to real market demand]  
                **What it pays:** [Realistic salary range]  
                **How to get there:** [Specific, actionable steps]  
                **Growth potential:** [Where this can lead in 2-3 years]

                ### **Option 2: [Realistic Role/Path]**  
                **Why this makes sense:** [Be honest about pros and cons]  
                **What it pays:** [Don't oversell - be realistic]  
                **How to get there:** [What they need to learn/do]  
                **Growth potential:** [Realistic career progression]

                ### **Option 3: [Realistic Role/Path]**  
                **Why this makes sense:** [Focus on market trends and demand]  
                **What it pays:** [Honest numbers]  
                **How to get there:** [Concrete next steps]  
                **Growth potential:** [Where this realistically leads]

                *(Only add more options if there are genuinely different paths worth exploring)*

                ---

                ## My Honest Take

                Look, here's the thing - you don't need to figure out your entire career right now. The job market changes fast, and what matters is picking something that gets you moving in the right direction.

                Focus on building skills that are actually in demand, getting some experience under your belt, and staying flexible. The "perfect job" is usually the one you create by getting good at something people actually need.

                You've got solid foundations to work with. Now it's about making smart moves and staying consistent. You got this!

                ---

                ##  WRITING STYLE RULES:
                - Write like you're talking to a friend, not giving a presentation
                - Use real job titles that exist on LinkedIn and job boards  
                - Mention actual salary ranges when possible (be conservative, not optimistic)
                - Focus on skills that are trending in 2024-2025
                - Suggest roles that don't require 5+ years of experience they don't have
                - Be encouraging but realistic - no false promises
                - Use simple language, avoid corporate buzzwords
                - Give actionable advice they can start this week
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
        console.log("Error:", error);
        return NextResponse.json(
            { error: "AI Response not generated" },
            { status: 500 }
        );
    }
}


export async function GET() {
    try {
        const auth = await requireSession();
        if (auth.error) return auth.error;
        const { session } = auth;

        await connectDB()

        let query = {};
        if (session.user.role !== "admin") {
            query = { userEmail: session.user.email };
        }

        const recommendations = await recommendModel.find(query)

        if (!recommendations) {
            return NextResponse.json({ error: "no recommendation found" }, { status: 400 })
        }

        return NextResponse.json({ message: "recommendations fetched succesffuly", recommendations }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "error while fetching recommendations" }, { status: 500 })
    }
}