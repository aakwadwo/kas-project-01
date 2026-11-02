/**
 * GET /api/events/:id/registrations - the organizer's attendee list.
 *
 * App-layer controller: it composes EVENTS (ownership check),
 * REGISTRATIONS (who registered) and AUTH (names/emails) through their
 * public interfaces. It never queries another module's tables.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/jwt/auth";
import { errorResponse, notLoggedIn } from "@/lib/errors/http";
import { getUsersByIds } from "@/modules/auth";
import { getEventSummary } from "@/modules/events";
import { listActiveRegistrationsForEvent } from "@/modules/registrations";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(_request: Request, context: RouteContext) {
    try {
        const user = await getCurrentUser();
        if (!user) return notLoggedIn();

        const { id: eventId } = await context.params;

        const event = await getEventSummary(eventId);

        if (!event) {
            return NextResponse.json(
                { error: "Event not found." },
                { status: 404 }
            );
        }

        // Organizers can only manage their own events.
        if (event.organizerId !== user.userId) {
            return NextResponse.json(
                {
                    error: "You can only view registrations for your own events.",
                },
                { status: 403 }
            );
        }

        const registrations = await listActiveRegistrationsForEvent(
            eventId
        );

        const students = await getUsersByIds(
            registrations.map((r) => r.studentId)
        );
        const studentsById = new Map(students.map((s) => [s.id, s]));

        const result = registrations.map((registration) => ({
            id: registration.id,
            registeredAt: registration.registeredAt,
            student: studentsById.get(registration.studentId) ?? null,
        }));

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
        return errorResponse(error, "Could not load registrations.");
    }
}
