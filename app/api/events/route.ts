import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/jwt/auth";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

function isStillVisible(event: { startTime: string }) {
    const startTime = new Date(event.startTime).getTime();

    if (Number.isNaN(startTime)) {
        return true;
    }

    return Date.now() < startTime + ONE_HOUR_IN_MS;
}

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "You must be logged in." },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const mine = url.searchParams.get("mine");

        /*
         * MY EVENTS
         *
         * /api/events?mine=true
         *
         * Returns only events created by the
         * currently logged-in user.
         *
         * Events disappear one hour after
         * their start time.
         */
        if (mine === "true") {
            const { data: events, error } = await supabase
                .from("Event")
                .select("*")
                .eq("organizerId", user.userId)
                .order("startTime", {
                    ascending: true,
                });

            if (error) {
                console.error("Get my events error:", error);

                return NextResponse.json(
                    {
                        error: "Could not load your events.",
                    },
                    { status: 500 }
                );
            }

            const visibleEvents = (events || []).filter(
                isStillVisible
            );

            return NextResponse.json({
                events: visibleEvents,
            });
        }

        /*
         * ALL EVENTS
         *
         * Show:
         * - All published events
         * - The current user's own events
         *
         * Events disappear one hour after
         * their start time.
         */
        const { data: events, error } = await supabase
            .from("Event")
            .select("*")
            .or(
                `status.eq.PUBLISHED,organizerId.eq.${user.userId}`
            )
            .order("startTime", {
                ascending: true,
            });

        if (error) {
            console.error("Get events error:", error);

            return NextResponse.json(
                {
                    error: "Could not load events.",
                },
                { status: 500 }
            );
        }

        const visibleEvents = (events || []).filter(
            isStillVisible
        );

        return NextResponse.json({
            events: visibleEvents,
        });
    } catch (error) {
        console.error("Get events error:", error);

        return NextResponse.json(
            {
                error: "Could not load events.",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    error: "You must be logged in.",
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const title = String(body.title || "").trim();

        const description = String(
            body.description || ""
        ).trim();

        const location = String(
            body.location || ""
        ).trim();

        const startTime = body.startTime;
        const endTime = body.endTime;

        const capacity = Number(body.capacity);

        if (
            !title ||
            !description ||
            !location ||
            !startTime ||
            !endTime
        ) {
            return NextResponse.json(
                {
                    error:
                        "Title, description, location, start time and end time are required.",
                },
                { status: 400 }
            );
        }

        if (
            !Number.isInteger(capacity) ||
            capacity <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Capacity must be a positive whole number.",
                },
                { status: 400 }
            );
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return NextResponse.json(
                {
                    error: "Invalid event date or time.",
                },
                { status: 400 }
            );
        }

        /*
         * The event must start in the future.
         */
        if (start <= new Date()) {
            return NextResponse.json(
                {
                    error:
                        "Event start time must be in the future.",
                },
                { status: 400 }
            );
        }

        /*
         * The event must end after it starts.
         */
        if (end <= start) {
            return NextResponse.json(
                {
                    error:
                        "End time must be after start time.",
                },
                { status: 400 }
            );
        }

        const { data: event, error } = await supabase
            .from("Event")
            .insert({
                title,
                description,
                location,
                startTime,
                endTime,
                capacity,
                status: "DRAFT",
                organizerId: user.userId,
            })
            .select("*")
            .single();

        if (error) {
            console.error("Create event error:", error);

            return NextResponse.json(
                {
                    error: "Could not create event.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "Event created successfully.",
                event,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create event error:", error);

        return NextResponse.json(
            {
                error: "Could not create event.",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    error: "You must be logged in.",
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const eventId = body.id;

        if (!eventId) {
            return NextResponse.json(
                {
                    error: "Event ID is required.",
                },
                { status: 400 }
            );
        }

        const { data: existingEvent, error: findError } =
            await supabase
                .from("Event")
                .select("*")
                .eq("id", eventId)
                .eq("organizerId", user.userId)
                .maybeSingle();

        if (findError) {
            console.error(
                "Find event error:",
                findError
            );

            return NextResponse.json(
                {
                    error: "Could not find event.",
                },
                { status: 500 }
            );
        }

        if (!existingEvent) {
            return NextResponse.json(
                {
                    error:
                        "Event not found or you do not own this event.",
                },
                { status: 404 }
            );
        }

        if (existingEvent.status === "CANCELLED") {
            return NextResponse.json(
                {
                    error:
                        "Cancelled events cannot be edited.",
                },
                { status: 400 }
            );
        }

        if (existingEvent.status === "COMPLETED") {
            return NextResponse.json(
                {
                    error:
                        "Completed events cannot be edited.",
                },
                { status: 400 }
            );
        }

        const title = String(body.title || "").trim();

        const description = String(
            body.description || ""
        ).trim();

        const location = String(
            body.location || ""
        ).trim();

        const startTime = body.startTime;
        const endTime = body.endTime;

        const capacity = Number(body.capacity);

        if (
            !title ||
            !description ||
            !location ||
            !startTime ||
            !endTime
        ) {
            return NextResponse.json(
                {
                    error:
                        "Title, description, location, start time and end time are required.",
                },
                { status: 400 }
            );
        }

        if (
            !Number.isInteger(capacity) ||
            capacity <= 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Capacity must be a positive whole number.",
                },
                { status: 400 }
            );
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return NextResponse.json(
                {
                    error: "Invalid event date or time.",
                },
                { status: 400 }
            );
        }

        /*
         * Edited events must also start in the future.
         */
        if (start <= new Date()) {
            return NextResponse.json(
                {
                    error:
                        "Event start time must be in the future.",
                },
                { status: 400 }
            );
        }

        /*
         * The event must end after it starts.
         */
        if (end <= start) {
            return NextResponse.json(
                {
                    error:
                        "End time must be after start time.",
                },
                { status: 400 }
            );
        }

        const { data: event, error } =
            await supabase
                .from("Event")
                .update({
                    title,
                    description,
                    location,
                    startTime,
                    endTime,
                    capacity,
                    updatedAt: new Date().toISOString(),
                })
                .eq("id", eventId)
                .eq("organizerId", user.userId)
                .select("*")
                .single();

        if (error) {
            console.error(
                "Update event error:",
                error
            );

            return NextResponse.json(
                {
                    error: "Could not update event.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Event updated successfully.",
            event,
        });
    } catch (error) {
        console.error(
            "Update event error:",
            error
        );

        return NextResponse.json(
            {
                error: "Could not update event.",
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    error: "You must be logged in.",
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const eventId = body.id;
        const status = body.status;

        if (!eventId || !status) {
            return NextResponse.json(
                {
                    error:
                        "Event ID and status are required.",
                },
                { status: 400 }
            );
        }

        if (
            status !== "PUBLISHED" &&
            status !== "CANCELLED"
        ) {
            return NextResponse.json(
                {
                    error: "Invalid event status.",
                },
                { status: 400 }
            );
        }

        const { data: existingEvent, error: findError } =
            await supabase
                .from("Event")
                .select("*")
                .eq("id", eventId)
                .eq("organizerId", user.userId)
                .maybeSingle();

        if (findError) {
            console.error(
                "Find event error:",
                findError
            );

            return NextResponse.json(
                {
                    error: "Could not find event.",
                },
                { status: 500 }
            );
        }

        if (!existingEvent) {
            return NextResponse.json(
                {
                    error:
                        "Event not found or you do not own this event.",
                },
                { status: 404 }
            );
        }

        if (existingEvent.status === "COMPLETED") {
            return NextResponse.json(
                {
                    error:
                        "Completed events cannot be changed.",
                },
                { status: 400 }
            );
        }

        if (
            existingEvent.status === "CANCELLED" &&
            status === "PUBLISHED"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Cancelled events cannot be published again.",
                },
                { status: 400 }
            );
        }

        /*
         * An event cannot be published if its
         * start time has already passed.
         */
        if (
            status === "PUBLISHED" &&
            new Date(existingEvent.startTime) <= new Date()
        ) {
            return NextResponse.json(
                {
                    error:
                        "This event cannot be published because its start time has already passed. Please edit the event and choose a future date and time.",
                },
                { status: 400 }
            );
        }

        const { data: event, error } =
            await supabase
                .from("Event")
                .update({
                    status,
                    updatedAt: new Date().toISOString(),
                })
                .eq("id", eventId)
                .eq("organizerId", user.userId)
                .select("*")
                .single();

        if (error) {
            console.error(
                "Change event status error:",
                error
            );

            return NextResponse.json(
                {
                    error:
                        "Could not update event status.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message:
                "Event status updated successfully.",
            event,
        });
    } catch (error) {
        console.error(
            "Change event status error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Could not update event status.",
            },
            { status: 500 }
        );
    }
}