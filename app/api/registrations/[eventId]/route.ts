import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/jwt/auth";

type RouteContext = {
    params: Promise<{
        eventId: string;
    }>;
};

// GET - Check the current user's registration
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

        const { eventId } = await context.params;

        const { data: registration, error } = await supabase
            .from("Registration")
            .select("*")
            .eq("studentId", user.userId)
            .eq("eventId", eventId)
            .maybeSingle();

        if (error) {
            console.error("Check registration error:", error);

            return NextResponse.json(
                { error: "Could not check registration." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            registration: registration || null,
        });
    } catch (error) {
        console.error("Check registration error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}

// POST - Register for an event
export async function POST(
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

        const { eventId } = await context.params;

        if (!eventId) {
            return NextResponse.json(
                { error: "Event ID is required." },
                { status: 400 }
            );
        }

        // Get the event
        const { data: event, error: eventError } = await supabase
            .from("Event")
            .select("*")
            .eq("id", eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: "Event not found." },
                { status: 404 }
            );
        }

        // Only published events can be registered for
        if (event.status !== "PUBLISHED") {
            return NextResponse.json(
                { error: "You can only register for published events." },
                { status: 400 }
            );
        }

        // Prevent registering for your own event
        if (event.organizerId === user.userId) {
            return NextResponse.json(
                { error: "You cannot register for your own event." },
                { status: 400 }
            );
        }

        // Don't allow registration after the event has started
        const now = new Date();
        const startTime = new Date(event.startTime);

        if (startTime <= now) {
            return NextResponse.json(
                { error: "Registration is closed because the event has started." },
                { status: 400 }
            );
        }

        // Check for an existing registration
        const { data: existingRegistration, error: existingError } =
            await supabase
                .from("Registration")
                .select("*")
                .eq("studentId", user.userId)
                .eq("eventId", eventId)
                .maybeSingle();

        if (existingError) {
            console.error(
                "Check existing registration error:",
                existingError
            );

            return NextResponse.json(
                { error: "Could not check existing registration." },
                { status: 500 }
            );
        }

        // Already registered
        if (
            existingRegistration &&
            existingRegistration.status === "REGISTERED"
        ) {
            return NextResponse.json(
                { error: "You are already registered for this event." },
                { status: 400 }
            );
        }

        // Count active registrations
        const { count, error: countError } = await supabase
            .from("Registration")
            .select("*", {
                count: "exact",
                head: true,
            })
            .eq("eventId", eventId)
            .eq("status", "REGISTERED");

        if (countError) {
            console.error("Registration count error:", countError);

            return NextResponse.json(
                { error: "Could not check event capacity." },
                { status: 500 }
            );
        }

        const registeredCount = count || 0;

        if (registeredCount >= event.capacity) {
            return NextResponse.json(
                { error: "This event is already full." },
                { status: 400 }
            );
        }

        let registration;

        // If the user previously cancelled, reactivate that registration
        if (existingRegistration) {
            const { data, error } = await supabase
                .from("Registration")
                .update({
                    status: "REGISTERED",
                    registeredAt: new Date().toISOString(),
                    cancelledAt: null,
                })
                .eq("id", existingRegistration.id)
                .select()
                .single();

            if (error) {
                console.error("Restore registration error:", error);

                return NextResponse.json(
                    { error: "Could not register for the event." },
                    { status: 500 }
                );
            }

            registration = data;
        } else {
            // Create a new registration
            const { data, error } = await supabase
                .from("Registration")
                .insert({
                    studentId: user.userId,
                    eventId,
                    status: "REGISTERED",
                })
                .select()
                .single();

            if (error) {
                console.error("Create registration error:", error);

                return NextResponse.json(
                    { error: "Could not register for the event." },
                    { status: 500 }
                );
            }

            registration = data;
        }

        return NextResponse.json(
            {
                message: "Successfully registered for the event.",
                registration,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register event error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}

// DELETE - Cancel registration
export async function DELETE(
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

        const { eventId } = await context.params;

        // Get the event
        const { data: event, error: eventError } = await supabase
            .from("Event")
            .select("id, startTime")
            .eq("id", eventId)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: "Event not found." },
                { status: 404 }
            );
        }

        // Cancellation must happen before the event starts
        const now = new Date();
        const startTime = new Date(event.startTime);

        if (startTime <= now) {
            return NextResponse.json(
                { error: "You cannot cancel registration after the event has started." },
                { status: 400 }
            );
        }

        // Find registration
        const { data: registration, error: registrationError } =
            await supabase
                .from("Registration")
                .select("*")
                .eq("studentId", user.userId)
                .eq("eventId", eventId)
                .eq("status", "REGISTERED")
                .maybeSingle();

        if (registrationError) {
            console.error(
                "Find registration error:",
                registrationError
            );

            return NextResponse.json(
                { error: "Could not find your registration." },
                { status: 500 }
            );
        }

        if (!registration) {
            return NextResponse.json(
                { error: "You are not registered for this event." },
                { status: 404 }
            );
        }

        const { data: updatedRegistration, error: updateError } =
            await supabase
                .from("Registration")
                .update({
                    status: "CANCELLED",
                    cancelledAt: new Date().toISOString(),
                })
                .eq("id", registration.id)
                .select()
                .single();

        if (updateError) {
            console.error(
                "Cancel registration error:",
                updateError
            );

            return NextResponse.json(
                { error: "Could not cancel your registration." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Registration cancelled successfully.",
            registration: updatedRegistration,
        });
    } catch (error) {
        console.error("Cancel registration error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}