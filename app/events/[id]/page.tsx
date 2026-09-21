"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

type Registration = {
    id: string;
    studentId: string;
    eventId: string;
    status: "REGISTERED" | "CANCELLED";
    registeredAt: string;
    cancelledAt: string | null;
};

export default function EventDetailsPage() {
    const params = useParams();
    const eventId = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [registration, setRegistration] =
        useState<Registration | null>(null);

    const [currentUserId, setCurrentUserId] =
        useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState("");
    const [eventExpired, setEventExpired] = useState(false);

    async function loadEvent() {
        try {
            setLoading(true);
            setError("");
            setEventExpired(false);

            const userResponse = await fetch("/api/auth/me", {
                cache: "no-store",
            });

            if (!userResponse.ok) {
                window.location.replace("/login");
                return;
            }

            const userData = await userResponse.json();

            if (!userData.user?.id) {
                window.location.replace("/login");
                return;
            }

            setCurrentUserId(userData.user.id);

            const eventResponse = await fetch(
                `/api/events/${eventId}`,
                {
                    cache: "no-store",
                }
            );

            const eventData = await eventResponse.json();

            if (eventResponse.status === 401) {
                window.location.replace("/login");
                return;
            }

            if (eventResponse.status === 410) {
                setEventExpired(true);
                return;
            }

            if (!eventResponse.ok) {
                setError(
                    eventData.error || "Could not load event."
                );
                return;
            }

            setEvent(eventData.event);

            const registrationResponse = await fetch(
                `/api/registrations/${eventId}`,
                {
                    cache: "no-store",
                }
            );

            if (registrationResponse.status === 401) {
                window.location.replace("/login");
                return;
            }

            const registrationData =
                await registrationResponse.json();

            if (registrationResponse.ok) {
                setRegistration(
                    registrationData.registration || null
                );
            }
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!eventId) {
            return;
        }

        loadEvent();

        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                loadEvent();
            }
        };

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener(
                "pageshow",
                handlePageShow
            );
        };
    }, [eventId]);

    async function handleRegister() {
        try {
            setRegistering(true);
            setError("");

            const response = await fetch(
                `/api/registrations/${eventId}`,
                {
                    method: "POST",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            if (!response.ok) {
                setError(
                    data.error ||
                    "Could not register for event."
                );
                return;
            }

            setRegistration(data.registration);
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setRegistering(false);
        }
    }

    async function handleCancelRegistration() {
        const confirmed = window.confirm(
            "Are you sure you want to cancel your registration?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setRegistering(true);
            setError("");

            const response = await fetch(
                `/api/registrations/${eventId}`,
                {
                    method: "DELETE",
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            if (!response.ok) {
                setError(
                    data.error ||
                    "Could not cancel registration."
                );
                return;
            }

            setRegistration(data.registration);
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setRegistering(false);
        }
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    }

    function formatShortDate(dateString: string) {
        return new Date(dateString).toLocaleDateString(
            undefined,
            {
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

    function getStatusLabel(status: EventStatus) {
        switch (status) {
            case "PUBLISHED":
                return "Live";
            case "CANCELLED":
                return "Cancelled";
            case "COMPLETED":
                return "Completed";
            case "DRAFT":
            default:
                return "Draft";
        }
    }

    function getStatusClasses(status: EventStatus) {
        switch (status) {
            case "PUBLISHED":
                return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";

            case "CANCELLED":
                return "border-red-400/30 bg-red-400/10 text-red-300";

            case "COMPLETED":
                return "border-white/15 bg-white/10 text-gray-300";

            case "DRAFT":
            default:
                return "border-amber-400/30 bg-amber-400/10 text-amber-300";
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-[#f5f7fb]">
                    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
                        <div className="animate-pulse">
                            <div className="h-5 w-32 rounded bg-gray-200" />

                            <div className="mt-7 overflow-hidden rounded-3xl bg-gray-200">
                                <div className="h-72 sm:h-80" />
                            </div>

                            <div className="-mt-10 px-4 sm:px-8">
                                <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                                    <div className="h-10 w-3/4 rounded bg-gray-200" />

                                    <div className="mt-4 h-5 w-1/2 rounded bg-gray-200" />

                                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                        {Array.from({
                                            length: 3,
                                        }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="h-24 rounded-2xl bg-gray-100"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (eventExpired) {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 sm:px-8">
                    <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
                        <div className="w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
                            <div className="bg-gray-950 px-6 py-12 text-center sm:px-12 sm:py-16">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                                    ⏱
                                </div>

                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                                    Event unavailable
                                </p>

                                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    This event has ended
                                </h1>

                                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-400 sm:text-base">
                                    This event is no longer available because
                                    more than one hour has passed since it
                                    started.
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 p-6 sm:p-8">
                                <Link
                                    href="/events"
                                    className="rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    Browse Events
                                </Link>

                                <Link
                                    href="/events/my-events"
                                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                                >
                                    My Events
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (error && !event) {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 sm:px-8">
                    <div className="mx-auto max-w-5xl">
                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
                            <div className="bg-gray-950 px-6 py-10 sm:px-10">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-lg font-bold text-red-400">
                                    !
                                </div>

                                <h1 className="mt-5 text-2xl font-bold text-white">
                                    Unable to load event
                                </h1>

                                <p className="mt-2 text-sm leading-6 text-gray-400">
                                    {error}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 p-6 sm:p-8">
                                <button
                                    type="button"
                                    onClick={loadEvent}
                                    className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    Try again
                                </button>

                                <Link
                                    href="/events"
                                    className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                                >
                                    Back to Events
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!event) {
        return null;
    }

    const isOwner =
        currentUserId === event.organizerId;

    const isRegistered =
        registration?.status === "REGISTERED";

    const eventHasStarted =
        new Date(event.startTime).getTime() <=
        Date.now();

    const canRegister =
        !isOwner &&
        event.status === "PUBLISHED" &&
        !eventHasStarted;

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#f5f7fb]">
                <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
                    {/* Top navigation */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/events"
                            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-base shadow-sm transition group-hover:-translate-x-0.5">
                                ←
                            </span>

                            Back to Events
                        </Link>

                        <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 sm:block">
                            Campus Events
                        </span>
                    </div>

                    {/* Hero */}
                    <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gray-950 shadow-2xl">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.28),transparent_32%),radial-gradient(circle_at_15%_90%,rgba(16,185,129,0.14),transparent_28%)]" />

                        <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                                        event.status
                                    )}`}
                                >
                                    {getStatusLabel(event.status)}
                                </span>

                                {isOwner && (
                                    <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-xs font-bold text-blue-300">
                                        Your Event
                                    </span>
                                )}

                                {isRegistered && !isOwner && (
                                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                                        ✓ Registered
                                    </span>
                                )}
                            </div>

                            <div className="mt-7 max-w-4xl">
                                <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                                    {event.title}
                                </h1>

                                <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                                    Discover the details, secure your place,
                                    and get ready to be part of this campus
                                    event.
                                </p>
                            </div>

                            <div className="mt-9 flex flex-wrap gap-3 text-sm text-gray-300">
                                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                                    <span>📅</span>
                                    {formatShortDate(event.startTime)}
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                                    <span>🕐</span>
                                    {formatTime(event.startTime)}
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm">
                                    <span>📍</span>
                                    <span className="max-w-[220px] truncate">
                                        {event.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Main content */}
                    <div className="relative -mt-8 grid gap-6 px-2 sm:px-5 lg:grid-cols-[1fr_360px] lg:px-8">
                        {/* Left content */}
                        <div className="space-y-6">
                            {/* Event details */}
                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                                        Event information
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                                        Everything you need to know
                                    </h2>
                                </div>

                                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                    <div className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-blue-200 hover:bg-blue-50/40">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg">
                                                📅
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                                                    Date
                                                </p>

                                                <p className="mt-2 text-sm font-bold leading-6 text-gray-950">
                                                    {formatDate(
                                                        event.startTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-violet-200 hover:bg-violet-50/40">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-lg">
                                                🕐
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                                                    Time
                                                </p>

                                                <p className="mt-2 text-sm font-bold leading-6 text-gray-950">
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
                                    </div>

                                    <div className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                                                📍
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                                                    Location
                                                </p>

                                                <p className="mt-2 break-words text-sm font-bold leading-6 text-gray-950">
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-orange-200 hover:bg-orange-50/40">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-lg">
                                                👥
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                                                    Capacity
                                                </p>

                                                <p className="mt-2 text-sm font-bold leading-6 text-gray-950">
                                                    {event.capacity}{" "}
                                                    {event.capacity === 1
                                                        ? "person"
                                                        : "people"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Description */}
                            <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                                    About this event
                                </p>

                                <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                                    Event description
                                </h2>

                                <div className="mt-6 border-l-4 border-blue-500 pl-5">
                                    <p className="whitespace-pre-wrap text-sm leading-8 text-gray-600 sm:text-base">
                                        {event.description}
                                    </p>
                                </div>
                            </section>

                            {/* Error */}
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 font-bold text-red-600">
                                            !
                                        </span>

                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Registration panel */}
                        <aside className="lg:sticky lg:top-6 lg:self-start">
                            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl shadow-gray-300/40">
                                <div className="bg-gray-950 p-6 sm:p-7">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                                        Attendance
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                                        {isOwner
                                            ? "Manage your event"
                                            : isRegistered
                                                ? "You're going"
                                                : "Ready to attend?"}
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-gray-400">
                                        {isOwner
                                            ? "Manage registrations and attendance from your events dashboard."
                                            : isRegistered
                                                ? "Your place is currently reserved for this event."
                                                : "Secure your place before registration closes."}
                                    </p>
                                </div>

                                <div className="p-6 sm:p-7">
                                    {/* Event summary */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm">
                                                📅
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                                                    Date
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-gray-900">
                                                    {formatShortDate(
                                                        event.startTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-sm">
                                                🕐
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                                                    Starts
                                                </p>

                                                <p className="mt-1 text-sm font-bold text-gray-900">
                                                    {formatTime(
                                                        event.startTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm">
                                                📍
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
                                                    Location
                                                </p>

                                                <p className="mt-1 truncate text-sm font-bold text-gray-900">
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="my-6 border-t border-gray-200" />

                                    {/* Owner */}
                                    {isOwner ? (
                                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                                    ✓
                                                </div>

                                                <div>
                                                    <h3 className="font-bold text-blue-950">
                                                        This is your event
                                                    </h3>

                                                    <p className="mt-1 text-xs leading-5 text-blue-700">
                                                        Manage your event,
                                                        registrations, and
                                                        attendance.
                                                    </p>
                                                </div>
                                            </div>

                                            <Link
                                                href="/events/my-events"
                                                className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                                            >
                                                Manage Event
                                            </Link>
                                        </div>
                                    ) : isRegistered ? (
                                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-bold text-emerald-700">
                                                    ✓
                                                </div>

                                                <div>
                                                    <h3 className="font-bold text-emerald-950">
                                                        Registration confirmed
                                                    </h3>

                                                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                                                        Your place is reserved
                                                        for this event.
                                                    </p>
                                                </div>
                                            </div>

                                            {event.status === "PUBLISHED" &&
                                                !eventHasStarted && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleCancelRegistration
                                                        }
                                                        disabled={registering}
                                                        className="mt-5 flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-5 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {registering
                                                            ? "Cancelling..."
                                                            : "Cancel Registration"}
                                                    </button>
                                                )}
                                        </div>
                                    ) : canRegister ? (
                                        <div>
                                            <button
                                                type="button"
                                                onClick={handleRegister}
                                                disabled={registering}
                                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span>
                                                    {registering
                                                        ? "Registering..."
                                                        : "Register for Event"}
                                                </span>

                                                {!registering && (
                                                    <span className="text-lg transition-transform group-hover:translate-x-1">
                                                        →
                                                    </span>
                                                )}
                                            </button>

                                            <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                                                Registration closes when the
                                                event starts.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-gray-200 bg-gray-100 p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-200 font-bold text-gray-500">
                                                    i
                                                </div>

                                                <div>
                                                    <h3 className="font-bold text-gray-900">
                                                        Registration unavailable
                                                    </h3>

                                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                                        {event.status !==
                                                        "PUBLISHED"
                                                            ? "Registration is only available for published events."
                                                            : eventHasStarted
                                                                ? "Registration is closed because this event has already started."
                                                                : "Registration is not available for this event."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!isOwner &&
                                        event.status === "PUBLISHED" &&
                                        !eventHasStarted && (
                                            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Registration is currently open
                                            </div>
                                        )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}