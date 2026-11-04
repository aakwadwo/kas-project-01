"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EventTicket from "@/components/EventTicket";
import {
    CloseButton,
    EmptyState,
    Notice,
    PageHeader,
    Sheet,
    useConfirm,
} from "@/components/ui";
import {
    ArrowRightIcon,
    EditIcon,
    MegaphoneIcon,
    PlusIcon,
    SpinnerIcon,
    UsersIcon,
} from "@/components/icons";
import {
    formatShortDate,
    initials,
    plural,
    type EventStatus,
} from "@/lib/ui/format";

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
    const [now, setNow] = useState(() => Date.now());

    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionError, setActionError] = useState("");

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [registrationData, setRegistrationData] =
        useState<RegistrationData | null>(null);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [registrationError, setRegistrationError] = useState("");

    const { confirm, dialog } = useConfirm();

    async function loadMyEvents() {
        try {
            setLoading(true);
            setError("");
            setNow(Date.now());

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

            const response = await fetch("/api/events?mine=true", {
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Could not load your events.");
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
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, []);

    async function updateStatus(
        eventId: string,
        status: "PUBLISHED" | "CANCELLED",
        failMessage: string
    ) {
        try {
            setActionLoading(eventId);
            setActionError("");

            const response = await fetch("/api/events", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                cache: "no-store",
                body: JSON.stringify({ id: eventId, status }),
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setActionError(data.error || failMessage);
                return;
            }

            await loadMyEvents();
        } catch {
            setActionError("Could not connect to the server.");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleCancel(event: Event) {
        const ok = await confirm({
            title: "Cancel this event?",
            body: `"${event.title}" will be marked as cancelled for everyone who registered. This can't be undone.`,
            confirmLabel: "Cancel event",
            destructive: true,
        });
        if (ok) {
            await updateStatus(event.id, "CANCELLED", "Could not cancel event.");
        }
    }

    async function viewRegistrations(event: Event) {
        try {
            setSelectedEvent(event);
            setRegistrationData(null);
            setRegistrationError("");
            setLoadingRegistrations(true);

            const response = await fetch(`/api/events/${event.id}/registrations`, {
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setRegistrationError(data.error || "Could not load registrations.");
                return;
            }

            setRegistrationData(data);
        } catch {
            setRegistrationError("Could not connect to the server.");
        } finally {
            setLoadingRegistrations(false);
        }
    }

    function closeRegistrations() {
        setSelectedEvent(null);
        setRegistrationData(null);
        setRegistrationError("");
    }

    const counts = useMemo(() => {
        const c = { DRAFT: 0, PUBLISHED: 0, CANCELLED: 0, COMPLETED: 0 };
        for (const e of events) c[e.status] = (c[e.status] ?? 0) + 1;
        return c;
    }, [events]);

    const sorted = useMemo(() => {
        // Drafts first (they need action), then by date.
        const rank: Record<EventStatus, number> = {
            DRAFT: 0,
            PUBLISHED: 1,
            COMPLETED: 2,
            CANCELLED: 3,
        };
        return [...events].sort(
            (a, b) =>
                rank[a.status] - rank[b.status] ||
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
    }, [events]);

    const filled = registrationData
        ? Math.min(
              100,
              (registrationData.registrationCount /
                  Math.max(1, registrationData.event.capacity)) *
                  100
          )
        : 0;
    const remaining = registrationData
        ? Math.max(0, registrationData.event.capacity - registrationData.registrationCount)
        : 0;

    return (
        <>
            <Navbar />

            <main className="flex-1 px-4 py-10 sm:px-8 md:py-14">
                <div className="mx-auto max-w-7xl">
                    <PageHeader
                        eyebrow="Hosting desk"
                        title="Your events"
                        description="Drafts waiting to go live, events on the board, and who's signed up."
                        actions={
                            <Link href="/events/create" className="btn btn-primary btn-lg">
                                <PlusIcon size={18} strokeWidth={2.5} />
                                New event
                            </Link>
                        }
                    />

                    {!loading && !error && events.length > 0 && (
                        <dl className="mb-10 grid grid-cols-2 overflow-hidden rounded-2xl border-2 border-ink bg-card sm:grid-cols-4">
                            {[
                                { label: "Drafts", value: counts.DRAFT, accent: "text-ink" },
                                { label: "Live", value: counts.PUBLISHED, accent: "text-moss" },
                                { label: "Wrapped", value: counts.COMPLETED, accent: "text-ink-soft" },
                                { label: "Cancelled", value: counts.CANCELLED, accent: "text-signal-deep" },
                            ].map((s, i) => (
                                <div
                                    key={s.label}
                                    className={`border-ink p-5 ${i % 2 === 1 ? "border-l-2" : ""} ${
                                        i >= 2 ? "border-t-2 sm:border-t-0" : ""
                                    } ${i === 2 ? "sm:border-l-2" : ""}`}
                                >
                                    <dt className="eyebrow !text-[0.68rem]">{s.label}</dt>
                                    <dd className={`mt-1 font-display text-4xl font-extrabold tracking-tight ${s.accent}`}>
                                        {s.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    {actionError && (
                        <div className="mb-6">
                            <Notice tone="error" title="That didn't go through">
                                {actionError}
                            </Notice>
                        </div>
                    )}

                    {error && (
                        <Notice
                            tone="error"
                            title="Couldn't load your events"
                            action={
                                <button type="button" onClick={loadMyEvents} className="btn btn-outline btn-sm">
                                    Try again
                                </button>
                            }
                        >
                            {error}
                        </Notice>
                    )}

                    {loading && (
                        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="skeleton h-64 rounded-2xl" />
                            ))}
                        </div>
                    )}

                    {!loading && !error && events.length === 0 && (
                        <EmptyState
                            icon={<MegaphoneIcon size={28} />}
                            eyebrow="Nothing hosted yet"
                            title="Your desk is clear"
                            action={
                                <Link href="/events/create" className="btn btn-signal btn-lg">
                                    Create your first event
                                    <ArrowRightIcon size={18} strokeWidth={2.5} />
                                </Link>
                            }
                        >
                            Pin up a talk, a social or a workshop. It stays a
                            private draft until you publish.
                        </EmptyState>
                    )}

                    {!loading && !error && events.length > 0 && (
                        <div className="stagger grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                            {sorted.map((event) => {
                                const busy = actionLoading === event.id;
                                const editable =
                                    event.status !== "CANCELLED" &&
                                    event.status !== "COMPLETED";

                                return (
                                    <EventTicket
                                        key={event.id}
                                        event={event}
                                        now={now}
                                        actions={
                                            <>
                                                {event.status === "DRAFT" && (
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            updateStatus(event.id, "PUBLISHED", "Could not publish event.")
                                                        }
                                                        className="btn btn-signal btn-sm flex-1"
                                                    >
                                                        {busy ? <SpinnerIcon size={15} /> : <MegaphoneIcon size={15} />}
                                                        Publish
                                                    </button>
                                                )}

                                                {event.status === "PUBLISHED" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => viewRegistrations(event)}
                                                        className="btn btn-primary btn-sm flex-1"
                                                    >
                                                        <UsersIcon size={15} />
                                                        Guest list
                                                    </button>
                                                )}

                                                {!editable && (
                                                    <Link href={`/events/${event.id}`} className="btn btn-outline btn-sm flex-1">
                                                        View
                                                    </Link>
                                                )}

                                                {editable && (
                                                    <>
                                                        <Link
                                                            href={`/events/edit?id=${event.id}`}
                                                            className="btn btn-outline btn-sm !px-3"
                                                            aria-label={`Edit ${event.title}`}
                                                            title="Edit"
                                                        >
                                                            <EditIcon size={16} />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            disabled={busy}
                                                            onClick={() => handleCancel(event)}
                                                            className="btn btn-ghost btn-sm text-signal-deep"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Guest list */}
            <Sheet
                open={selectedEvent !== null}
                onClose={closeRegistrations}
                labelledBy="guestlist-title"
            >
                {selectedEvent && (
                    <div className="flex max-h-[inherit] flex-col">
                        <div className="flex items-start justify-between gap-4 border-b-2 border-ink p-6">
                            <div className="min-w-0">
                                <p className="eyebrow">Guest list</p>
                                <h2
                                    id="guestlist-title"
                                    className="mt-1 line-clamp-2 font-display text-2xl font-extrabold tracking-tight"
                                >
                                    {selectedEvent.title}
                                </h2>
                            </div>
                            <CloseButton onClick={closeRegistrations} label="Close guest list" />
                        </div>

                        <div className="overflow-y-auto p-6">
                            {loadingRegistrations && (
                                <div className="space-y-3" aria-busy="true">
                                    <div className="skeleton h-28" />
                                    <div className="skeleton h-14" />
                                    <div className="skeleton h-14" />
                                </div>
                            )}

                            {registrationError && (
                                <Notice tone="error" title="Couldn't load the guest list">
                                    {registrationError}
                                </Notice>
                            )}

                            {registrationData && !registrationError && (
                                <>
                                    <div className="rounded-2xl border-2 border-ink bg-paper p-5">
                                        <div className="flex items-end justify-between gap-6">
                                            <p className="font-display text-5xl font-extrabold leading-none tracking-tighter">
                                                {registrationData.registrationCount}
                                                <span className="text-2xl text-ink-mute">
                                                    {" "}
                                                    / {registrationData.event.capacity}
                                                </span>
                                            </p>
                                            <p className="text-right font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                                                {plural(remaining, "spot")} left
                                            </p>
                                        </div>
                                        <div
                                            className="mt-4 h-4 overflow-hidden rounded-full border-2 border-ink bg-card"
                                            role="progressbar"
                                            aria-valuemin={0}
                                            aria-valuemax={registrationData.event.capacity}
                                            aria-valuenow={registrationData.registrationCount}
                                            aria-label={`${registrationData.registrationCount} of ${registrationData.event.capacity} spots filled`}
                                        >
                                            <div
                                                className={`h-full transition-[width] duration-500 ${
                                                    filled >= 100 ? "bg-signal" : "bg-moss"
                                                }`}
                                                style={{ width: `${filled}%` }}
                                            />
                                        </div>
                                    </div>

                                    {registrationData.registrations.length === 0 ? (
                                        <div className="mt-6 rounded-2xl border-2 border-dashed border-ink/40 p-10 text-center">
                                            <UsersIcon size={28} className="mx-auto text-ink-mute" />
                                            <p className="mt-3 font-display text-lg font-extrabold">
                                                No one yet
                                            </p>
                                            <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-ink-soft">
                                                Registrations show up here as
                                                they come in.
                                            </p>
                                        </div>
                                    ) : (
                                        <ol className="mt-6 divide-y-2 divide-dashed divide-line">
                                            {registrationData.registrations.map((registration, index) => (
                                                <li key={registration.id} className="flex items-center gap-4 py-3">
                                                    <span className="w-6 shrink-0 text-right font-mono text-xs font-semibold text-ink-mute">
                                                        {String(index + 1).padStart(2, "0")}
                                                    </span>
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-sun-wash font-display text-sm font-extrabold">
                                                        {registration.student?.name
                                                            ? initials(registration.student.name)
                                                            : "?"}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-semibold">
                                                            {registration.student?.name || "Unknown user"}
                                                        </p>
                                                        <p className="truncate text-sm text-ink-soft">
                                                            {registration.student?.email || "No email available"}
                                                        </p>
                                                    </div>
                                                    <span className="hidden shrink-0 font-mono text-[0.7rem] text-ink-mute sm:block">
                                                        {formatShortDate(registration.registeredAt)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Sheet>

            {dialog}
        </>
    );
}
