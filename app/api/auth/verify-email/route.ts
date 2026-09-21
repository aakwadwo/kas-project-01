import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                {
                    error: "Verification token is required.",
                },
                { status: 400 }
            );
        }

        // Find the user associated with this verification token.
        const { data: user, error: userError } = await supabase
            .from("User")
            .select("id, emailVerified")
            .eq("verificationToken", token)
            .maybeSingle();

        if (userError) {
            console.error(
                "Find verification user error:",
                userError
            );

            return NextResponse.json(
                {
                    error: "Could not verify your email.",
                },
                { status: 500 }
            );
        }

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "This verification link is invalid or has already been used.",
                },
                { status: 400 }
            );
        }

        // If the email has already been verified.
        if (user.emailVerified) {
            return NextResponse.json({
                message: "Your email is already verified.",
            });
        }

        // Mark the email as verified and remove the token.
        const { error: updateError } = await supabase
            .from("User")
            .update({
                emailVerified: true,
                verificationToken: null,
            })
            .eq("id", user.id);

        if (updateError) {
            console.error(
                "Verify email update error:",
                updateError
            );

            return NextResponse.json(
                {
                    error:
                        "Could not complete email verification.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message:
                "Your email has been verified successfully.",
        });
    } catch (error) {
        console.error("Email verification error:", error);

        return NextResponse.json(
            {
                error: "Something went wrong.",
            },
            { status: 500 }
        );
    }
}