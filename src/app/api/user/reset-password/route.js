import { connectDB } from "@/db/connectDB";
import { validatePassword } from "@/lib/validation";

import OTPModel from "@/models/OTPModel";
import userModel from "@/models/userModel";

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { email, otp, newPassword } = body;

    // Validate required fields
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);

    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Password does not meet complexity requirements",
          errors: [
            {
              field: "newPassword",
              messages: passwordValidation.errors,
            },
          ],
        },
        { status: 400 }
      );
    }

    await connectDB();

    const sanitizedEmail = email.toLowerCase().trim();

    // Find OTP record
    const otpRecord = await OTPModel.findOne({
      email: sanitizedEmail,
    });

    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found",
        },
        { status: 400 }
      );
    }

    // Check OTP match
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (new Date(otpRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP expired",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await userModel.findOne({
      email: sanitizedEmail,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Update password
    // IMPORTANT:
    // Do NOT hash manually here.
    // Mongoose pre-save hook handles hashing.

    user.password = newPassword;

    await user.save();

    // Invalidate OTP after successful reset
    await OTPModel.deleteOne({
      email: sanitizedEmail,
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}