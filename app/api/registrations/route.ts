/**
 * GET /api/registrations - the logged-in student's registrations,
 * together with event details and whether they actually attended.
 *
 * This route lives in the app layer, so it is allowed to COMPOSE several
 * modules through their public interfaces.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/jwt/auth";
import { errorResponse, notLoggedIn } from "@/lib/errors/http";
import { getEventSummaries } from "@/modules/events";
import { listMyRegistrations } from "@/modules/registrations";

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return notLoggedIn();

        const registrations = await listMyRegistrations(user.userId);
        const eventIds = registrations.map((r) => r.eventId);

        const events = await getEventSummaries(eventIds);
        const eventsById = new Map(events.map((e) => [e.id, e]));

        return NextResponse.json({
            registrations: registrations.map((registration) => ({
                ...registration,
                event: eventsById.get(registration.eventId) ?? null,
                attended: false, // filled in by the attendance branch
            })),
        });
    } catch (error) {
        return errorResponse(error, "Could not load your registrations.");
    }
}
