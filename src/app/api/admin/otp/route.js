import { connectDB } from "@/db/connectDB"
import OTPModel from "@/models/OTPModel";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        await connectDB()
        const otp = await OTPModel.find({})

        if (!otp) {
            return NextResponse.json({ error: "No otp found" }, { status: 400 })
        }

        return NextResponse.json({ message: "otp fetched successfully", otp }, { status: 200 })
    } catch (error) {
        console.log("error: ", error)
        return NextResponse.json({ message: "error while fetching otp" }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const auth = await requireAdmin();
        if (auth.error) return auth.error;

        const { searchParams } = new URL(request.url)
        const email = searchParams.get("email")

        if (!email) {
            return NextResponse.json({ error: "Missing email id" }, { status: 400 })
        }

        await connectDB()
        const deletedOTP = await OTPModel.findOneAndDelete({ email })

        if (!deletedOTP) {
            return NextResponse.json({ error: "OTP not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "OTP deleted successfully" }, { status: 200 });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Error while deleting otp" }, { status: 500 });
    }
}