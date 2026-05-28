import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY || "dummy-key-for-build",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});


export async function InterviewAnswer(userAnswer, question) {
    try {
        const system_prompt = `
You are a friendly and experienced Mock Interviewer. Your task is to evaluate the user's answer to an interview question and return feedback in the following strict JavaScript object format.

✅ Return ONLY this object:
{
  "overallFeedback": string,
  "strengths": string[],
  "areasForImprovement": string[],
  "correctness": string,
  "relevance": string,
  "clarity": string
}

✅ Important Instructions:
- DO NOT return JSON, markdown, or code blocks
- DO NOT use triple backticks
- DO NOT stringify the object
- DO NOT return multiple small objects. COMBINE everything into ONE object with 6 keys exactly.

✅ Tone & Content:
- Encourage the user first
- Highlight 2–3 strengths
- Clearly list improvement points
- Be short, specific, and constructive

Return the response as a raw JavaScript object ONLY, and nothing else.
`;


        const response = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "system", content: system_prompt },
                {
                    role: "user",
                    content: userAnswer, question,
                },
            ],
        });

        return response.choices[0].message.content
    } catch (error) {
        console.log("error: ", error)
    }
}