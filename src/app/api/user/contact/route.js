import { sendUserEmail } from "@/lib/contact-mail";
import { NextResponse } from "next/server";
import { connectDB } from "@/db/connectDB";
import ContactLogModel from "@/models/ContactLogModel";

const COOLDOWN_SECONDS = 300; // 5 minutes

export async function POST(req) {
    try {
        const { useremail, name, message } = await req.json();

        if (!useremail || !name || !message) {
            return NextResponse.json(
                { success: false, error: "All fields are required" },
                { status: 400 }
            );
        }

        const sanitizedEmail = useremail.trim().toLowerCase();

        await connectDB();

        // Rate Limiting Check
        const recentLog = await ContactLogModel.findOne({ email: sanitizedEmail });
        if (recentLog) {
            const secondsSinceLastSent = (Date.now() - new Date(recentLog.createdAt).getTime()) / 1000;
            const remainingCooldown = Math.ceil(COOLDOWN_SECONDS - secondsSinceLastSent);

            if (remainingCooldown > 0) {
                return NextResponse.json(
                    { success: false, error: "You've sent a message recently.Please try again later." },
                    { status: 429 }
                );
            }
            
            await ContactLogModel.deleteOne({ email: sanitizedEmail });
        }

        await sendUserEmail(sanitizedEmail, name, message);

        await ContactLogModel.create({ email: sanitizedEmail });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Contact API error:", err);
        return NextResponse.json(
            { success: false, error: "Failed to send email" },
            { status: 500 }
        );
    }
}