"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

type EventStatus =
    | "DRAFT"
    | "PUBLISHED"
    | "CANCELLED"
    | "COMPLETED";

type Event = {
    id: string;
    title: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    capacity: number;
    status: EventStatus;
    organizerId: string;
};

type RegisteredStudent = {
    id: string;
    name: string;
    email: string;
};

type Registration = {
    id: string;
    registeredAt: string;
    student: RegisteredStudent | null;
};

type RegistrationData = {
    event: {
        id: string;
        title: string;
        capacity: number;
    };
    registrationCount: number;
    registrations: Registration[];
};

export default function MyEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedEvent, setSelectedEvent] =
        useState<Event | null>(null);

    const [registrationData, setRegistrationData] =
        useState<RegistrationData | null>(null);

    const [loadingRegistrations, setLoadingRegistrations] =
        useState(false);

    const [registrationError, setRegistrationError] =
        useState("");

    async function loadMyEvents() {
        try {
            setLoading(true);
            setError("");

            const authResponse = await fetch("/api/auth/me", {
                cache: "no-store",
            });

            if (!authResponse.ok) {
                window.location.replace("/login");
                return;
            }

            const authData = await authResponse.json();

            if (!authData.user) {
                window.location.replace("/login");
                return;
            }

            const response = await fetch(
                "/api/events?mine=true",
                {
                    cache: "no-store",
                }
            );

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error ||
                    "Could not load your events."
                );
                return;
            }

            setEvents(data.events || []);
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMyEvents();

        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                loadMyEvents();
            }
        }

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener(
                "pageshow",
                handlePageShow
            );
        };
    }, []);

    async function viewRegistrations(event: Event) {
        try {
            setSelectedEvent(event);
            setRegistrationData(null);
            setRegistrationError("");
            setLoadingRegistrations(true);

            const response = await fetch(
                `/api/events/${event.id}/registrations`,
                {
                    cache: "no-store",
                }
            );

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setRegistrationError(
                    data.error ||
                    "Could not load registrations."
                );
                return;
            }

            setRegistrationData(data);
        } catch {
            setRegistrationError(
                "Could not connect to the server."
            );
        } finally {
            setLoadingRegistrations(false);
        }
    }

    function closeRegistrations() {
        setSelectedEvent(null);
        setRegistrationData(null);
        setRegistrationError("");
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString(
            undefined,
            {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );
    }

    function formatTime(dateString: string) {
        return new Date(dateString).toLocaleTimeString(
            undefined,
            {
                hour: "numeric",
                minute: "2-digit",
            }
        );
    }

    function getStatusClasses(status: EventStatus) {
        switch (status) {
            case "PUBLISHED":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";

            case "CANCELLED":
                return "border-red-200 bg-red-50 text-red-700";

            case "COMPLETED":
                return "border-gray-200 bg-gray-100 text-gray-600";

            case "DRAFT":
            default:
                return "border-amber-200 bg-amber-50 text-amber-700";
        }
    }

    function getStatusLabel(status: EventStatus) {
        switch (status) {
            case "PUBLISHED":
                return "Published";

            case "CANCELLED":
                return "Cancelled";

            case "COMPLETED":
                return "Completed";

            default:
                return "Draft";
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8 md:py-14">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 animate-pulse">
                            <div className="h-3 w-28 rounded bg-gray-200" />
                            <div className="mt-4 h-11 w-56 rounded-lg bg-gray-200" />
                            <div className="mt-4 h-5 w-80 max-w-full rounded bg-gray-200" />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                    >
                                        <div className="animate-pulse p-6">
                                            <div className="h-6 w-24 rounded-full bg-gray-200" />

                                            <div className="mt-6 h-7 w-3/4 rounded bg-gray-200" />

                                            <div className="mt-4 space-y-2">
                                                <div className="h-4 rounded bg-gray-200" />
                                                <div className="h-4 w-5/6 rounded bg-gray-200" />
                                            </div>

                                            <div className="mt-7 space-y-4">
                                                <div className="flex gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-gray-200" />

                                                    <div className="flex-1">
                                                        <div className="h-3 w-12 rounded bg-gray-200" />
                                                        <div className="mt-2 h-4 w-32 rounded bg-gray-200" />
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-gray-200" />

                                                    <div className="flex-1">
                                                        <div className="h-3 w-12 rounded bg-gray-200" />
                                                        <div className="mt-2 h-4 w-28 rounded bg-gray-200" />
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-gray-200" />

                                                    <div className="flex-1">
                                                        <div className="h-3 w-16 rounded bg-gray-200" />
                                                        <div className="mt-2 h-4 w-36 rounded bg-gray-200" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 bg-gray-50 p-4">
                                            <div className="h-10 rounded-lg bg-gray-200" />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8 md:py-14">
                <div className="mx-auto max-w-7xl">

                    {/* Header */}
                    <section className="mb-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                                    Event Management
                                </p>

                                <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                                    My Events
                                </h1>

                                <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                                    Manage the events you have created,
                                    review registrations, and keep your
                                    event information up to date.
                                </p>
                            </div>

                            <Link
                                href="/events/create"
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-950 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                            >
                                <span className="text-lg leading-none">
                                    +
                                </span>

                                Create Event
                            </Link>
                        </div>
                    </section>

                    {/* Error */}
                    {error && (
                        <div
                            role="alert"
                            className="mb-8 rounded-2xl border border-red-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-red-600">
                                    !
                                </div>

                                <div className="flex-1">
                                    <h2 className="font-bold text-gray-950">
                                        Something went wrong
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-red-600">
                                        {error}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={loadMyEvents}
                                        className="mt-3 text-sm font-semibold text-gray-900 underline underline-offset-4 hover:no-underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!error && events.length === 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm sm:px-10">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                                📅
                            </div>

                            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                                Event management
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                                You haven't created an event yet
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                                Create your first campus event and
                                give students something to look
                                forward to.
                            </p>

                            <Link
                                href="/events/create"
                                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                <span className="text-lg leading-none">
                                    +
                                </span>

                                Create Your First Event
                            </Link>
                        </div>
                    )}

                    {/* Count */}
                    {!error && events.length > 0 && (
                        <div className="mb-5">
                            <p className="text-sm font-medium text-gray-500">
                                You have{" "}
                                <span className="font-bold text-gray-900">
                                    {events.length}
                                </span>{" "}
                                {events.length === 1
                                    ? "event"
                                    : "events"}
                            </p>
                        </div>
                    )}

                    {/* Event grid */}
                    {!error && events.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <article
                                    key={event.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    {/* Card content */}
                                    <div className="flex flex-1 flex-col p-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                                                    event.status
                                                )}`}
                                            >
                                                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />

                                                {getStatusLabel(
                                                    event.status
                                                )}
                                            </span>

                                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                                {event.capacity}{" "}
                                                {event.capacity === 1
                                                    ? "spot"
                                                    : "spots"}
                                            </span>
                                        </div>

                                        <h2 className="mt-5 line-clamp-2 min-h-[3.5rem] text-xl font-bold leading-tight tracking-tight text-gray-950">
                                            {event.title}
                                        </h2>

                                        <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-600">
                                            {event.description}
                                        </p>

                                        <div className="mt-7 space-y-4">
                                            {/* Date */}
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm">
                                                    📅
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                                        Date
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold leading-5 text-gray-900">
                                                        {formatDate(
                                                            event.startTime
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Time */}
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm">
                                                    🕐
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                                        Time
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold leading-5 text-gray-900">
                                                        {formatTime(
                                                            event.startTime
                                                        )}
                                                        {" – "}
                                                        {formatTime(
                                                            event.endTime
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm">
                                                    📍
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                                        Location
                                                    </p>

                                                    <p className="mt-1 truncate text-sm font-semibold leading-5 text-gray-900">
                                                        {event.location}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Link
                                                href={`/events/${event.id}`}
                                                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                                            >
                                                View
                                            </Link>

                                            {event.status !==
                                                "CANCELLED" &&
                                                event.status !==
                                                "COMPLETED" && (
                                                    <Link
                                                        href={`/events/edit?id=${event.id}`}
                                                        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}

                                            {event.status ===
                                                "PUBLISHED" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            viewRegistrations(
                                                                event
                                                            )
                                                        }
                                                        className="rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                                    >
                                                        Registrations
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Registrations modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeRegistrations();
                        }
                    }}
                >
                    <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        {/* Modal header */}
                        <div className="border-b border-gray-200 p-6 sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                                        Event registrations
                                    </p>

                                    <h2 className="mt-2 line-clamp-2 text-2xl font-bold tracking-tight text-gray-950">
                                        {selectedEvent.title}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeRegistrations}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-950"
                                    aria-label="Close registrations"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="overflow-y-auto p-6 sm:p-7">
                            {loadingRegistrations && (
                                <div className="space-y-4">
                                    <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />

                                    <div className="h-16 animate-pulse rounded-xl bg-gray-100" />

                                    <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                                </div>
                            )}

                            {registrationError && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                                >
                                    <div className="font-semibold">
                                        Could not load registrations
                                    </div>

                                    <p className="mt-1">
                                        {registrationError}
                                    </p>
                                </div>
                            )}

                            {registrationData &&
                                !registrationError && (
                                    <>
                                        {/* Summary */}
                                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                            <div className="flex items-end justify-between gap-6">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                                                        Registered
                                                    </p>

                                                    <p className="mt-1 text-3xl font-bold tracking-tight text-gray-950">
                                                        {
                                                            registrationData.registrationCount
                                                        }
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                                                        Capacity
                                                    </p>

                                                    <p className="mt-1 text-lg font-bold text-gray-950">
                                                        {
                                                            registrationData
                                                                .event
                                                                .capacity
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className="mt-5 h-2 overflow-hidden rounded-full bg-gray-200"
                                                aria-label={`${registrationData.registrationCount} of ${registrationData.event.capacity} spots filled`}
                                            >
                                                <div
                                                    className="h-full rounded-full bg-gray-950 transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            (registrationData.registrationCount /
                                                                Math.max(
                                                                    1,
                                                                    registrationData
                                                                        .event
                                                                        .capacity
                                                                )) *
                                                            100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                            <p className="mt-2 text-xs text-gray-500">
                                                {Math.max(
                                                    0,
                                                    registrationData.event
                                                        .capacity -
                                                    registrationData.registrationCount
                                                )}{" "}
                                                {Math.max(
                                                    0,
                                                    registrationData.event
                                                        .capacity -
                                                    registrationData.registrationCount
                                                ) === 1
                                                    ? "spot"
                                                    : "spots"}{" "}
                                                remaining
                                            </p>
                                        </div>

                                        {/* Empty registrations */}
                                        {registrationData.registrations
                                            .length === 0 ? (
                                            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-10 text-center">
                                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                                                    👥
                                                </div>

                                                <h3 className="mt-4 font-bold text-gray-950">
                                                    No registrations yet
                                                </h3>

                                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                                    Students who register
                                                    for this event will
                                                    appear here.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mt-6">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-gray-950">
                                                        Attendees
                                                    </h3>

                                                    <span className="text-xs font-medium text-gray-400">
                                                        {
                                                            registrationData
                                                                .registrations
                                                                .length
                                                        }{" "}
                                                        registered
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    {registrationData.registrations.map(
                                                        (
                                                            registration,
                                                            index
                                                        ) => (
                                                            <div
                                                                key={
                                                                    registration.id
                                                                }
                                                                className="rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
                                                            >
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <div className="flex min-w-0 items-center gap-3">
                                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                                                            {index +
                                                                                1}
                                                                        </div>

                                                                        <div className="min-w-0">
                                                                            <p className="truncate text-sm font-semibold text-gray-950">
                                                                                {registration
                                                                                        .student
                                                                                        ?.name ||
                                                                                    "Unknown user"}
                                                                            </p>

                                                                            <p className="mt-0.5 truncate text-sm text-gray-500">
                                                                                {registration
                                                                                        .student
                                                                                        ?.email ||
                                                                                    "No email available"}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <p className="shrink-0 text-xs font-medium text-gray-400">
                                                                        {formatDate(
                                                                            registration.registeredAt
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-5">
                            <button
                                type="button"
                                onClick={closeRegistrations}
                                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}