
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export type AuthUser = {
    userId: string;
    role: "STUDENT" | "ORGANIZER" | "ADMIN";
};

export async function getCurrentUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();

    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        return null;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (
            typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.userId !== "string" ||
            typeof decoded.role !== "string"
        ) {
            return null;
        }

        return {
            userId: decoded.userId,
            role: decoded.role as AuthUser["role"],
        };
    } catch {
        return null;
    }
}

