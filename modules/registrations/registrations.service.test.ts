import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/lib/errors";
import type { EventSummary } from "@/modules/events";
import * as repo from "./registrations.repository";
import {
    cancelRegistration,
    isStudentRegistered,
    registerForEvent,
} from "./registrations.service";
import type { Registration } from "./registrations.types";

// The service must only talk to EVENTS through its public interface,
// and to the database through its own repository. Mock both.
vi.mock("@/lib/supabase/client", () => ({ supabase: {} })); // never hit a real DB
vi.mock("./registrations.repository");
vi.mock("@/modules/events", () => ({ getEventSummary: vi.fn() }));

import { getEventSummary } from "@/modules/events";

const futureEvent: EventSummary = {
    id: "event-1",
    title: "Hack Night",
    location: "Lab 3",
    status: "PUBLISHED",
    startTime: new Date(Date.now() + 24 * 3600_000).toISOString(),
    endTime: new Date(Date.now() + 27 * 3600_000).toISOString(),
    capacity: 2,
    organizerId: "organizer-1",
};

const registration: Registration = {
    id: "reg-1",
    studentId: "student-1",
    eventId: "event-1",
    status: "REGISTERED",
    registeredAt: "2026-05-30T10:00:00Z",
    cancelledAt: null,
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getEventSummary).mockResolvedValue(futureEvent);
    vi.mocked(repo.findByStudentAndEvent).mockResolvedValue(null);
    vi.mocked(repo.countActiveByEvent).mockResolvedValue(0);
});

describe("registerForEvent", () => {
    it("creates a new registration", async () => {
        vi.mocked(repo.insert).mockResolvedValue(registration);

        const result = await registerForEvent("student-1", "event-1");

        expect(result).toBe(registration);
        expect(repo.insert).toHaveBeenCalledWith("student-1", "event-1");
    });

    it("404s when the event does not exist", async () => {
        vi.mocked(getEventSummary).mockResolvedValue(null);

        await expect(
            registerForEvent("student-1", "missing")
        ).rejects.toMatchObject({ status: 404 });
        expect(repo.insert).not.toHaveBeenCalled();
    });

    it("reactivates a previously cancelled registration instead of inserting", async () => {
        vi.mocked(repo.findByStudentAndEvent).mockResolvedValue({
            ...registration,
            status: "CANCELLED",
        });
        vi.mocked(repo.reactivate).mockResolvedValue(registration);

        await registerForEvent("student-1", "event-1");

        expect(repo.reactivate).toHaveBeenCalledWith("reg-1");
        expect(repo.insert).not.toHaveBeenCalled();
    });

    it("refuses when the event is full", async () => {
        vi.mocked(repo.countActiveByEvent).mockResolvedValue(2);

        await expect(
            registerForEvent("student-1", "event-1")
        ).rejects.toMatchObject({ status: 409 });
        expect(repo.insert).not.toHaveBeenCalled();
    });

    it("turns a database unique violation (double click) into a 409", async () => {
        vi.mocked(repo.insert).mockRejectedValue({ code: "23505" });

        const promise = registerForEvent("student-1", "event-1");

        await expect(promise).rejects.toBeInstanceOf(DomainError);
        await expect(promise).rejects.toMatchObject({ status: 409 });
    });

    it("lets unexpected errors bubble up", async () => {
        vi.mocked(repo.insert).mockRejectedValue(new Error("db down"));

        await expect(
            registerForEvent("student-1", "event-1")
        ).rejects.toThrow("db down");
    });
});

describe("cancelRegistration", () => {
    it("cancels an active registration before the event starts", async () => {
        vi.mocked(repo.findByStudentAndEvent).mockResolvedValue(
            registration
        );
        vi.mocked(repo.markCancelled).mockResolvedValue({
            ...registration,
            status: "CANCELLED",
        });

        const result = await cancelRegistration("student-1", "event-1");

        expect(result.status).toBe("CANCELLED");
        expect(repo.markCancelled).toHaveBeenCalledWith("reg-1");
    });

    it("refuses when the student is not registered", async () => {
        await expect(
            cancelRegistration("student-1", "event-1")
        ).rejects.toMatchObject({ status: 404 });
        expect(repo.markCancelled).not.toHaveBeenCalled();
    });
});

describe("isStudentRegistered", () => {
    it("is true only for active registrations", async () => {
        vi.mocked(repo.findByStudentAndEvent).mockResolvedValueOnce(
            registration
        );
        expect(await isStudentRegistered("student-1", "event-1")).toBe(true);

        vi.mocked(repo.findByStudentAndEvent).mockResolvedValueOnce({
            ...registration,
            status: "CANCELLED",
        });
        expect(await isStudentRegistered("student-1", "event-1")).toBe(false);

        vi.mocked(repo.findByStudentAndEvent).mockResolvedValueOnce(null);
        expect(await isStudentRegistered("student-1", "event-1")).toBe(false);
    });
});
