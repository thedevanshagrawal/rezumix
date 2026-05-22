import { connectDB } from "@/db/connectDB"
import { sendOTPEmail } from "@/lib/mail"
import { validateRegistration, sanitizeString, isPlainString } from "@/lib/validation"
import OTPModel from "@/models/OTPModel"
import userModel from "@/models/userModel"
import { NextResponse } from "next/server"


export async function POST(req, res) {
    try {
        const body = await req.json()

        // ── 1. Type-check: reject non-string / object inputs (NoSQL injection prevention) ──
        if (!isPlainString(body.fullName) || !isPlainString(body.email) || !isPlainString(body.password)) {
            return NextResponse.json({
                message: "Invalid input types",
                errors: [{ field: "general", messages: ["All fields must be plain text strings"] }]
            }, { status: 400 })
        }

        const { fullName, email, password } = body

        // ── 2. Validate all fields with detailed per-field errors ──
        const validation = validateRegistration(fullName, email, password)

        if (!validation.valid) {
            return NextResponse.json({
                message: "Validation failed",
                errors: validation.errors
            }, { status: 400 })
        }

        // ── 3. Sanitize inputs (XSS prevention) ──
        const sanitizedName = sanitizeString(fullName)
        const sanitizedEmail = email.trim().toLowerCase() // email kept lowercase, not HTML-escaped

        await connectDB()

        // ── 4. Use sanitized email for DB lookup (prevents NoSQL injection via $gt, $ne, etc.) ──
        const existingUser = await userModel.findOne({ email: sanitizedEmail })

        if (existingUser) {
            return NextResponse.json({
                message: "A user with this email already exists",
                errors: [{ field: "email", messages: ["This email is already registered. Please log in instead."] }]
            }, { status: 409 })
        }

        const user = await userModel.create({
            fullName: sanitizedName,
            email: sanitizedEmail,
            password: password,
        })

        if (!user) {
            return NextResponse.json({
                message: "Failed to create user account",
                errors: [{ field: "general", messages: ["An unexpected error occurred while creating your account"] }]
            }, { status: 500 })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpSave = await OTPModel.create({
            email: sanitizedEmail,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            lastSentAt: new Date()
        })

        if (!otpSave) {
            return NextResponse.json({
                message: "Failed to generate verification code",
                errors: [{ field: "general", messages: ["Could not generate OTP. Please try again."] }]
            }, { status: 500 })
        }

        const sendOTP = await sendOTPEmail(sanitizedEmail, otp)

        if (!sendOTP) {
            console.log("error while sending otp", sendOTP)
            return NextResponse.json({
                message: "Failed to send verification email",
                errors: [{ field: "general", messages: ["Could not send OTP email. Please try again later."] }]
            }, { status: 500 })
        }

        // Update lastSentAt to the exact post-SMTP timestamp to eliminate the 3-5s email transport lag
        await OTPModel.updateOne({ email: sanitizedEmail }, { $set: { lastSentAt: new Date() } });

        // Don't return the full user object (leaks password hash, etc.)
        return NextResponse.json({
            success: true,
            message: "User registered successfully. Please verify your email.",
            user: { fullName: user.fullName, email: user.email }
        }, { status: 200 })

    } catch (error) {
        console.log("Registration error: ", error)
        return NextResponse.json({
            message: "Internal server error",
            errors: [{ field: "general", messages: ["Something went wrong. Please try again later."] }]
        }, { status: 500 })
    }
}