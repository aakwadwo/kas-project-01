import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/jwt/auth";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: Request,
    context: RouteContext
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "You must be logged in." },
                { status: 401 }
            );
        }

        const { id: eventId } = await context.params;

        if (!eventId) {
            return NextResponse.json(
                { error: "Event ID is required." },
                { status: 400 }
            );
        }

        // Find the event
        const { data: event, error: eventError } = await supabase
            .from("Event")
            .select("id, title, organizerId, capacity")
            .eq("id", eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: "Event not found." },
                { status: 404 }
            );
        }

        // Only the event creator can see registrations
        if (event.organizerId !== user.userId) {
            return NextResponse.json(
                {
                    error:
                        "You can only view registrations for your own events.",
                },
                { status: 403 }
            );
        }

        // Get registered users
        const { data: registrations, error: registrationError } =
            await supabase
                .from("Registration")
                .select(
                    `
          id,
          status,
          registeredAt,
          cancelledAt,
          studentId
        `
                )
                .eq("eventId", eventId)
                .eq("status", "REGISTERED")
                .order("registeredAt", { ascending: true });

        if (registrationError) {
            console.error(
                "Get registrations error:",
                registrationError
            );

            return NextResponse.json(
                { error: "Could not load registrations." },
                { status: 500 }
            );
        }

        // Get user details
        const studentIds = (registrations || []).map(
            (registration) => registration.studentId
        );

        let students: {
            id: string;
            name: string;
            email: string;
        }[] = [];

        if (studentIds.length > 0) {
            const { data: users, error: usersError } =
                await supabase
                    .from("User")
                    .select("id, name, email")
                    .in("id", studentIds);

            if (usersError) {
                console.error(
                    "Get registered users error:",
                    usersError
                );

                return NextResponse.json(
                    { error: "Could not load registered users." },
                    { status: 500 }
                );
            }

            students = users || [];
        }

        const studentsById = new Map(
            students.map((student) => [
                student.id,
                student,
            ])
        );

        const result = (registrations || []).map(
            (registration) => ({
                id: registration.id,
                registeredAt: registration.registeredAt,
                student:
                    studentsById.get(registration.studentId) || null,
            })
        );

        return NextResponse.json({
            event: {
                id: event.id,
                title: event.title,
                capacity: event.capacity,
            },
            registrationCount: result.length,
            registrations: result,
        });
    } catch (error) {
        console.error("Get event registrations error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}