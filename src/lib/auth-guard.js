import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function requireSession() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return {
            error: NextResponse.json(
                { error: "Unauthorized", message: "You must be logged in to perform this action" },
                { status: 401 }
            )
        };
    }
    return { session };
}

export async function requireAdmin() {
    const auth = await requireSession();
    if (auth.error) return auth.error;
    
    if (auth.session.user.role !== "admin") {
        return {
            error: NextResponse.json(
                { error: "Forbidden", message: "Admin access required" },
                { status: 403 }
            )
        };
    }
    return auth;
}

export function requireOwnership(session, resourceOwnerEmail) {
    if (
        session.user.email === resourceOwnerEmail ||
        session.user.role === "admin"
    ) {
        return true;
    }
    return {
        error: NextResponse.json(
            { error: "Forbidden", message: "You do not have permission to access this resource" },
            { status: 403 }
        )
    };
}
