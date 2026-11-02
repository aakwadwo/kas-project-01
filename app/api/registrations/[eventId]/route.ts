/**
 * Thin HTTP controller for the REGISTRATIONS module.
 * No business rules here - they live in modules/registrations.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/jwt/auth";
import { errorResponse, notLoggedIn } from "@/lib/errors/http";
import {
    cancelRegistration,
    getMyRegistration,
    registerForEvent,
} from "@/modules/registrations";

type RouteContext = {
    params: Promise<{
        eventId: string;
    }>;
};

// GET - the current user's registration for this event (or null)
export async function GET(_request: Request, context: RouteContext) {
    try {
        const user = await getCurrentUser();
        if (!user) return notLoggedIn();

        const { eventId } = await context.params;
        const registration = await getMyRegistration(
            user.userId,
            eventId
        );

        return NextResponse.json({ registration });
    } catch (error) {
        return errorResponse(error, "Could not check registration.");
    }
}

// POST - register for an event
export async function POST(_request: Request, context: RouteContext) {
    try {
        const user = await getCurrentUser();
        if (!user) return notLoggedIn();

        const { eventId } = await context.params;
        const registration = await registerForEvent(
            user.userId,
            eventId
        );

        return NextResponse.json(
            {
                message: "Successfully registered for the event.",
                registration,
            },
            { status: 201 }
        );
    } catch (error) {
        return errorResponse(error, "Could not register for the event.");
    }
}

// DELETE - cancel my registration
export async function DELETE(_request: Request, context: RouteContext) {
    try {
        const user = await getCurrentUser();
        if (!user) return notLoggedIn();

        const { eventId } = await context.params;
        const registration = await cancelRegistration(
            user.userId,
            eventId
        );

        return NextResponse.json({
            message: "Registration cancelled successfully.",
            registration,
        });
    } catch (error) {
        return errorResponse(error, "Could not cancel your registration.");
    }
}
