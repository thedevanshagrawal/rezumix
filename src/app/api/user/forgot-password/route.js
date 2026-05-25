import { connectDB } from "@/db/connectDB";
import { sendOTPEmail } from "@/lib/mail";
import { isPlainString, isValidEmail } from "@/lib/validation";
import OTPModel from "@/models/OTPModel";
import userModel from "@/models/userModel";
import { NextResponse } from "next/server";

const OTP_COOLDOWN_SECONDS = 60;

export async function POST(req) {
    try {
        const body = await req.json();

        if (!body || !isPlainString(body.email)) {
            return NextResponse.json({
                success: false,
                message: "Invalid input"
            }, { status: 400 });
        }

        const sanitizedEmail = body.email.trim().toLowerCase();

        if (!isValidEmail(sanitizedEmail)) {
            return NextResponse.json({
                success: false,
                message: "Invalid email format"
            }, { status: 400 });
        }

        await connectDB();

        // SECURITY:
        // Do NOT reveal whether user exists or not
        const user = await userModel.findOne({ email: sanitizedEmail });

        if (user) {

            const existingOTP = await OTPModel.findOne({ email: sanitizedEmail });

            if (existingOTP) {
                const referenceTime = existingOTP.lastSentAt
                    ? new Date(existingOTP.lastSentAt).getTime()
                    : new Date(existingOTP.createdAt).getTime();

                const secondsSinceLastSent =
                    (Date.now() - referenceTime) / 1000;

                const remainingCooldown =
                    Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastSent);

                if (remainingCooldown > 0) {
                    return NextResponse.json({
                        success: false,
                        message: `Please wait ${remainingCooldown} seconds before requesting another OTP`
                    }, { status: 429 });
                }

                await OTPModel.deleteOne({ email: sanitizedEmail });
            }

            const otp = Math.floor(
                100000 + Math.random() * 900000
            ).toString();

            await OTPModel.create({
                email: sanitizedEmail,
                otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                lastSentAt: new Date()
            });

            await sendOTPEmail(sanitizedEmail, otp);
        }

        return NextResponse.json({
            success: true,
            message:
                "If an account exists with this email, an OTP has been sent."
        }, { status: 200 });

    } catch (error) {
        console.log("Forgot password error:", error);

        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}