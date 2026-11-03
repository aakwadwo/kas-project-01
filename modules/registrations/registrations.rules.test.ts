import { describe, expect, it } from "vitest";
import { DomainError } from "@/lib/errors";
import type { EventSummary } from "@/modules/events";
import {
    assertCanRegister,
    getCancellableRegistration,
} from "./registrations.rules";
import type { Registration } from "./registrations.types";

const NOW = new Date("2026-06-01T12:00:00Z");

function makeEvent(overrides: Partial<EventSummary> = {}): EventSummary {
    return {
        id: "event-1",
        title: "Hack Night",
        location: "Lab 3",
        status: "PUBLISHED",
        startTime: "2026-06-02T12:00:00Z", // tomorrow
        endTime: "2026-06-02T15:00:00Z",
        capacity: 2,
        organizerId: "organizer-1",
        ...overrides,
    };
}

function makeRegistration(
    overrides: Partial<Registration> = {}
): Registration {
    return {
        id: "reg-1",
        studentId: "student-1",
        eventId: "event-1",
        status: "REGISTERED",
        registeredAt: "2026-05-30T10:00:00Z",
        cancelledAt: null,
        ...overrides,
    };
}

function expectDomainError(fn: () => unknown, status: number) {
    try {
        fn();
    } catch (error) {
        expect(error).toBeInstanceOf(DomainError);
        expect((error as DomainError).status).toBe(status);
        return;
    }
    throw new Error("Expected a DomainError but nothing was thrown");
}

describe("assertCanRegister", () => {
    const base = {
        studentId: "student-1",
        existing: null,
        activeCount: 0,
        now: NOW,
    };

    it("allows a student to register for a published, future event", () => {
        expect(() =>
            assertCanRegister({ ...base, event: makeEvent() })
        ).not.toThrow();
    });

    it.each(["CANCELLED", "COMPLETED"] as const)(
        "rejects %s events",
        (status) => {
            expectDomainError(
                () =>
                    assertCanRegister({
                        ...base,
                        event: makeEvent({ status }),
                    }),
                400
            );
        }
    );

    it("rejects DRAFT events", () => {
        expectDomainError(
            () =>
                assertCanRegister({
                    ...base,
                    event: makeEvent({ status: "DRAFT" }),
                }),
            400
        );
    });

    it("rejects the organizer of the event", () => {
        expectDomainError(
            () =>
                assertCanRegister({
                    ...base,
                    studentId: "organizer-1",
                    event: makeEvent(),
                }),
            400
        );
    });

    it("rejects registration once the event has started", () => {
        expectDomainError(
            () =>
                assertCanRegister({
                    ...base,
                    event: makeEvent({
                        startTime: "2026-06-01T11:00:00Z",
                    }),
                }),
            400
        );
    });

    it("rejects registering twice", () => {
        expectDomainError(
            () =>
                assertCanRegister({
                    ...base,
                    event: makeEvent(),
                    existing: makeRegistration(),
                }),
            409
        );
    });

    it("allows re-registering after a cancellation", () => {
        expect(() =>
            assertCanRegister({
                ...base,
                event: makeEvent(),
                existing: makeRegistration({ status: "CANCELLED" }),
            })
        ).not.toThrow();
    });

    it("rejects when the event is at capacity", () => {
        expectDomainError(
            () =>
                assertCanRegister({
                    ...base,
                    event: makeEvent({ capacity: 2 }),
                    activeCount: 2,
                }),
            409
        );
    });

    it("allows the last remaining spot", () => {
        expect(() =>
            assertCanRegister({
                ...base,
                event: makeEvent({ capacity: 2 }),
                activeCount: 1,
            })
        ).not.toThrow();
    });
});

describe("getCancellableRegistration", () => {
    it("returns the registration when cancelling before the event starts", () => {
        const registration = makeRegistration();

        expect(
            getCancellableRegistration({
                event: makeEvent(),
                registration,
                now: NOW,
            })
        ).toBe(registration);
    });

    it("rejects cancelling after the event has started", () => {
        expectDomainError(
            () =>
                getCancellableRegistration({
                    event: makeEvent({
                        startTime: "2026-06-01T11:00:00Z",
                    }),
                    registration: makeRegistration(),
                    now: NOW,
                }),
            400
        );
    });

    it("rejects when there is no registration", () => {
        expectDomainError(
            () =>
                getCancellableRegistration({
                    event: makeEvent(),
                    registration: null,
                    now: NOW,
                }),
            404
        );
    });

    it("rejects when the registration is already cancelled", () => {
        expectDomainError(
            () =>
                getCancellableRegistration({
                    event: makeEvent(),
                    registration: makeRegistration({
                        status: "CANCELLED",
                    }),
                    now: NOW,
                }),
            404
        );
    });
});
