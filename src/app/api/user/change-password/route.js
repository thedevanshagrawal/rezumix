import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-guard";

import userModel from "@/models/userModel";
import { connectDB } from "@/db/connectDB";
import { isPlainString, validatePassword } from "@/lib/validation";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // Safe body extraction
    if (!body || !body.passwordChange) {
      return NextResponse.json(
        {
          success: false,
          message: "Password change data is required",
          errors: [
            {
              field: "general",
              messages: ["Invalid request data"],
            },
          ],
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } =
      body.passwordChange;

    const auth = await requireSession();
    if (auth.error) return auth.error;
    const { session } = auth;

    if (
      !isPlainString(currentPassword) ||
      !isPlainString(newPassword) ||
      !isPlainString(confirmPassword)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid input types",
          errors: [
            {
              field: "general",
              messages: ["All inputs must be plain text strings"],
            },
          ],
        },
        { status: 400 }
      );
    }



    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords do not match",
          errors: [
            {
              field: "confirmPassword",
              messages: ["New passwords do not match"],
            },
          ],
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

    const user = await userModel.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          errors: [
            {
              field: "general",
              messages: ["User not found. Please log in again."],
            },
          ],
        },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect current password",
          errors: [
            {
              field: "currentPassword",
              messages: [
                "The current password you entered is incorrect",
              ],
            },
          ],
        },
        { status: 401 }
      );
    }

    // IMPORTANT:
    // Do NOT hash manually here.
    // Mongoose pre-save hook already hashes password.

    user.password = newPassword;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Password change error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        errors: [
          {
            field: "general",
            messages: [
              "Something went wrong. Please try again later.",
            ],
          },
        ],
      },
      { status: 500 }
    );
  }
}