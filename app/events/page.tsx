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

type CurrentUser = {
    id: string;
    name: string;
    email: string;
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] =
        useState<string | null>(null);

    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const userResponse = await fetch("/api/auth/me", {
                cache: "no-store",
            });

            if (!userResponse.ok) {
                window.location.replace("/login");
                return;
            }

            const userData = await userResponse.json();

            if (!userData.user) {
                window.location.replace("/login");
                return;
            }

            setUser(userData.user);

            const eventsResponse = await fetch("/api/events", {
                cache: "no-store",
            });

            if (!eventsResponse.ok) {
                if (eventsResponse.status === 401) {
                    window.location.replace("/login");
                    return;
                }

                const eventsData = await eventsResponse.json();

                setError(
                    eventsData.error || "Could not load events."
                );

                return;
            }

            const eventsData = await eventsResponse.json();

            setEvents(eventsData.events || []);
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();

        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                loadData();
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

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString(
            undefined,
            {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
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

    function getStatusStyles(status: EventStatus) {
        switch (status) {
            case "PUBLISHED":
                return "border-emerald-200 bg-emerald-50 text-emerald-700";

            case "CANCELLED":
                return "border-red-200 bg-red-50 text-red-700";

            case "COMPLETED":
                return "border-gray-200 bg-gray-100 text-gray-600";

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

    async function handlePublish(eventId: string) {
        try {
            setActionLoading(eventId);

            const response = await fetch("/api/events", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
                body: JSON.stringify({
                    id: eventId,
                    status: "PUBLISHED",
                }),
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.error ||
                    "Could not publish event."
                );
                return;
            }

            await loadData();
        } catch {
            alert("Could not connect to the server.");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleCancel(eventId: string) {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this event?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(eventId);

            const response = await fetch("/api/events", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
                body: JSON.stringify({
                    id: eventId,
                    status: "CANCELLED",
                }),
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                alert(
                    data.error ||
                    "Could not cancel event."
                );
                return;
            }

            await loadData();
        } catch {
            alert("Could not connect to the server.");
        } finally {
            setActionLoading(null);
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
                            <div className="mt-4 h-11 w-64 rounded-lg bg-gray-200" />
                            <div className="mt-4 h-5 w-96 max-w-full rounded bg-gray-200" />
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
                                                <div className="h-4 rounded bg-gray-200" />
                                                <div className="h-4 w-2/3 rounded bg-gray-200" />
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

                    {/* Page header */}
                    <section className="mb-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                                    Campus Events
                                </p>

                                <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                                    Discover events
                                </h1>

                                <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                                    Find something happening on campus,
                                    connect with your community, or create
                                    an event of your own.
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

                                <div>
                                    <h2 className="font-bold text-gray-950">
                                        Something went wrong
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-red-600">
                                        {error}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={loadData}
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
                                Your campus calendar
                            </p>

                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                                No events yet
                            </h2>

                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                                There are no published events available
                                right now. Create the first one and give
                                your campus community something to look
                                forward to.
                            </p>

                            <Link
                                href="/events/create"
                                className="mt-7 inline-flex items-center justify-center rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Create the first event
                            </Link>
                        </div>
                    )}

                    {/* Event count */}
                    {!error && events.length > 0 && (
                        <div className="mb-5 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">
                                Showing{" "}
                                <span className="font-bold text-gray-900">
                                    {events.length}
                                </span>{" "}
                                {events.length === 1
                                    ? "event"
                                    : "events"}
                            </p>
                        </div>
                    )}

                    {/* Events */}
                    {!error && events.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => {
                                const isOwner =
                                    user !== null &&
                                    event.organizerId === user.id;

                                const isActionLoading =
                                    actionLoading === event.id;

                                return (
                                    <article
                                        key={event.id}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        {/* Card content */}
                                        <div className="flex flex-1 flex-col p-6">
                                            {/* Status row */}
                                            <div className="flex items-center justify-between gap-3">
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyles(
                                                        event.status
                                                    )}`}
                                                >
                                                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />

                                                    {getStatusLabel(
                                                        event.status
                                                    )}
                                                </span>

                                                {isOwner && (
                                                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                                                        Your event
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h2 className="mt-5 line-clamp-2 min-h-[3.5rem] text-xl font-bold leading-tight tracking-tight text-gray-950">
                                                {event.title}
                                            </h2>

                                            {/* Description */}
                                            <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-600">
                                                {event.description}
                                            </p>

                                            {/* Details */}
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
                                                            )}{" "}
                                                            –{" "}
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

                                                {/* Capacity */}
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm">
                                                        👥
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                                            Capacity
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold leading-5 text-gray-900">
                                                            {event.capacity}{" "}
                                                            {event.capacity ===
                                                            1
                                                                ? "person"
                                                                : "people"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card actions */}
                                        <div className="border-t border-gray-100 bg-gray-50 p-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
                                                >
                                                    View Event
                                                </Link>

                                                {isOwner &&
                                                    event.status !==
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

                                                {isOwner &&
                                                    event.status ===
                                                    "DRAFT" && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                            onClick={() =>
                                                                handlePublish(
                                                                    event.id
                                                                )
                                                            }
                                                            className="rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {isActionLoading
                                                                ? "Publishing..."
                                                                : "Publish"}
                                                        </button>
                                                    )}

                                                {isOwner &&
                                                    event.status !==
                                                    "CANCELLED" &&
                                                    event.status !==
                                                    "COMPLETED" && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isActionLoading
                                                            }
                                                            onClick={() =>
                                                                handleCancel(
                                                                    event.id
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {isActionLoading
                                                                ? "Working..."
                                                                : "Cancel"}
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}