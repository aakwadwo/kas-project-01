"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type EventSummary = {
    id: string;
    title: string;
    location: string;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
    startTime: string;
    endTime: string;
};

type MyRegistration = {
    id: string;
    eventId: string;
    status: "REGISTERED" | "CANCELLED";
    registeredAt: string;
    cancelledAt: string | null;
    attended: boolean;
    event: EventSummary | null;
};

function formatDateTime(value: string) {
    return new Date(value).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function getBadge(registration: MyRegistration, now: number) {
    const started =
        registration.event &&
        new Date(registration.event.startTime).getTime() <= now;

    if (registration.status === "CANCELLED") {
        return {
            label: "Registration cancelled",
            classes: "border-gray-200 bg-gray-100 text-gray-600",
        };
    }

    if (registration.event?.status === "CANCELLED") {
        return {
            label: "Event cancelled",
            classes: "border-red-200 bg-red-50 text-red-700",
        };
    }

    if (registration.attended) {
        return {
            label: "✓ Attended",
            classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
        };
    }

    if (started) {
        return {
            label: "Not checked in",
            classes: "border-amber-200 bg-amber-50 text-amber-700",
        };
    }

    return {
        label: "Registered",
        classes: "border-blue-200 bg-blue-50 text-blue-700",
    };
}

export default function MyRegistrationsPage() {
    const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());

    async function load() {
        try {
            setLoading(true);
            setError("");
            setNow(Date.now());

            const response = await fetch("/api/registrations", {
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Could not load registrations.");
                return;
            }

            setRegistrations(data.registrations || []);
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function cancel(registration: MyRegistration) {
        if (!window.confirm("Cancel your registration for this event?")) {
            return;
        }

        try {
            setCancellingId(registration.id);
            setError("");

            const response = await fetch(
                `/api/registrations/${registration.eventId}`,
                { method: "DELETE", cache: "no-store" }
            );
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Could not cancel registration.");
                return;
            }

            await load();
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setCancellingId(null);
        }
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8 md:py-14">
                <div className="mx-auto max-w-4xl">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                        Student
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                        My Registrations
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Events you have registered for, and whether you were
                        checked in.
                    </p>

                    {error && (
                        <div
                            role="alert"
                            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <p className="mt-10 text-sm text-gray-500">
                            Loading...
                        </p>
                    ) : registrations.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                            <h2 className="font-bold text-gray-950">
                                No registrations yet
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Find an event and register to see it here.
                            </p>
                            <Link
                                href="/events"
                                className="mt-5 inline-block rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Browse Events
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-8 space-y-4">
                            {registrations.map((registration) => {
                                const badge = getBadge(registration, now);
                                const event = registration.event;
                                const canCancel =
                                    registration.status === "REGISTERED" &&
                                    event?.status === "PUBLISHED" &&
                                    new Date(event.startTime).getTime() >
                                        now;

                                return (
                                    <li
                                        key={registration.id}
                                        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/events/${registration.eventId}`}
                                                    className="text-lg font-bold text-gray-950 hover:underline"
                                                >
                                                    {event?.title ??
                                                        "Event no longer available"}
                                                </Link>

                                                {event && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {formatDateTime(
                                                            event.startTime
                                                        )}{" "}
                                                        · {event.location}
                                                    </p>
                                                )}
                                            </div>

                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs font-bold ${badge.classes}`}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>

                                        {canCancel && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    cancel(registration)
                                                }
                                                disabled={
                                                    cancellingId ===
                                                    registration.id
                                                }
                                                className="mt-4 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {cancellingId ===
                                                registration.id
                                                    ? "Cancelling..."
                                                    : "Cancel registration"}
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </main>
        </>
    );
}
