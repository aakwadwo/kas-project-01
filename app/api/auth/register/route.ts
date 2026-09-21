import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const name = String(body.name || "").trim();

        const email = String(body.email || "")
            .trim()
            .toLowerCase();

        const password = String(body.password || "");

        const role = String(body.role || "STUDENT");

        if (!name || !email || !password) {
            return NextResponse.json(
                {
                    error:
                        "Name, email and password are required.",
                },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    error:
                        "Password must be at least 6 characters.",
                },
                { status: 400 }
            );
        }

        if (
            role !== "STUDENT" &&
            role !== "ORGANIZER"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Account type must be Student or Organizer.",
                },
                { status: 400 }
            );
        }

        const { data: existingUser, error: existingError } =
            await supabase
                .from("User")
                .select("id")
                .eq("email", email)
                .maybeSingle();

        if (existingError) {
            throw existingError;
        }

        if (existingUser) {
            return NextResponse.json(
                {
                    error:
                        "An account with this email already exists.",
                },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(
            password,
            10
        );

        // Generate a secure email verification token.
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        const { data: user, error } = await supabase
            .from("User")
            .insert({
                name,
                email,
                passwordHash,
                role,
                emailVerified: false,
                verificationToken,
            })
            .select(
                "id, name, email, role, emailVerified"
            )
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json(
            {
                message:
                    "Account created successfully. Please verify your email address.",
                user,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);

        return NextResponse.json(
            {
                error: "Could not create account.",
            },
            { status: 500 }
        );
    }
}