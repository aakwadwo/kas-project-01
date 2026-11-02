/**
 * REGISTRATIONS service - orchestrates the repository and the rules.
 *
 * Depends on: EVENTS (public interface only).
 * Must NOT depend on: ATTENDANCE (that dependency goes the other way).
 */
import { DomainError, isUniqueViolation } from "@/lib/errors";
import { getEventSummary } from "@/modules/events";
import * as repo from "./registrations.repository";
import { assertCanRegister, getCancellableRegistration } from "./registrations.rules";
import type { Registration } from "./registrations.types";

export async function registerForEvent(
    studentId: string,
    eventId: string
): Promise<Registration> {
    const event = await getEventSummary(eventId);

    if (!event) {
        throw new DomainError("Event not found.", 404);
    }

    const [existing, activeCount] = await Promise.all([
        repo.findByStudentAndEvent(studentId, eventId),
        repo.countActiveByEvent(eventId),
    ]);

    assertCanRegister({ event, studentId, existing, activeCount });

    try {
        return existing
            ? await repo.reactivate(existing.id)
            : await repo.insert(studentId, eventId);
    } catch (error) {
        // Two clicks at the same time: the unique (studentId, eventId)
        // constraint in the database is our last line of defence.
        if (isUniqueViolation(error)) {
            throw new DomainError(
                "You are already registered for this event.",
                409
            );
        }
        throw error;
    }
}

export async function cancelRegistration(
    studentId: string,
    eventId: string
): Promise<Registration> {
    const event = await getEventSummary(eventId);

    if (!event) {
        throw new DomainError("Event not found.", 404);
    }

    const registration = await repo.findByStudentAndEvent(
        studentId,
        eventId
    );

    const cancellable = getCancellableRegistration({
        event,
        registration,
    });

    return repo.markCancelled(cancellable.id);
}

export function getMyRegistration(
    studentId: string,
    eventId: string
): Promise<Registration | null> {
    return repo.findByStudentAndEvent(studentId, eventId);
}

export function listMyRegistrations(
    studentId: string
): Promise<Registration[]> {
    return repo.listByStudent(studentId);
}

export function listActiveRegistrationsForEvent(
    eventId: string
): Promise<Registration[]> {
    return repo.listActiveByEvent(eventId);
}

export function countActiveRegistrations(
    eventId: string
): Promise<number> {
    return repo.countActiveByEvent(eventId);
}

export async function isStudentRegistered(
    studentId: string,
    eventId: string
): Promise<boolean> {
    const registration = await repo.findByStudentAndEvent(
        studentId,
        eventId
    );

    return registration?.status === "REGISTERED";
}
