/**
 * REGISTRATIONS business rules as PURE functions (no database, no I/O),
 * so they are trivial to unit test.
 */
import { DomainError } from "@/lib/errors";
import type { EventSummary } from "@/modules/events";
import type { Registration } from "./registrations.types";

export function assertCanRegister(input: {
    event: EventSummary;
    studentId: string;
    existing: Registration | null;
    activeCount: number;
    now?: Date;
}): void {
    const { event, studentId, existing, activeCount } = input;
    const now = input.now ?? new Date();

    if (event.status === "CANCELLED" || event.status === "COMPLETED") {
        throw new DomainError(
            `You cannot register for a ${event.status.toLowerCase()} event.`,
            400
        );
    }

    if (event.status !== "PUBLISHED") {
        throw new DomainError(
            "You can only register for published events.",
            400
        );
    }

    if (event.organizerId === studentId) {
        throw new DomainError(
            "You cannot register for your own event.",
            400
        );
    }

    if (new Date(event.startTime) <= now) {
        throw new DomainError(
            "Registration is closed because the event has started.",
            400
        );
    }

    if (existing?.status === "REGISTERED") {
        throw new DomainError(
            "You are already registered for this event.",
            409
        );
    }

    if (activeCount >= event.capacity) {
        throw new DomainError("This event is already full.", 409);
    }
}

/**
 * Checks the cancellation rules and returns the registration to cancel.
 */
export function getCancellableRegistration(input: {
    event: EventSummary;
    registration: Registration | null;
    now?: Date;
}): Registration {
    const { event, registration } = input;
    const now = input.now ?? new Date();

    if (new Date(event.startTime) <= now) {
        throw new DomainError(
            "You cannot cancel your registration after the event has started.",
            400
        );
    }

    if (!registration || registration.status !== "REGISTERED") {
        throw new DomainError(
            "You are not registered for this event.",
            404
        );
    }

    return registration;
}
