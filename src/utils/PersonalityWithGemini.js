import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});
export async function PersonalityWithGemini(answers, name) {
    try {

        const user_prompt =
            `Analyze the following personality questionnaire responses and predict the user's personality traits based on the Big Five model. Provide a brief summary with insights and recommendations, keeping the response concise with bullet points.

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

        const response = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "user", content: user_prompt }
            ],
        });

        return response.choices[0].message.content

    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "AI analysis failed.";
    }
}