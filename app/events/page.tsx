"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EventTicket from "@/components/EventTicket";
import {
    EmptyState,
    Notice,
    PageHeader,
    Tag,
    useConfirm,
} from "@/components/ui";
import {
    ArrowRightIcon,
    CalendarIcon,
    EditIcon,
    MegaphoneIcon,
    PlusIcon,
    SearchIcon,
    SpinnerIcon,
} from "@/components/icons";
import type { EventStatus } from "@/lib/ui/format";

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

type Filter = "all" | "week" | "mine";

const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "Everything" },
    { value: "week", label: "Next 7 days" },
    { value: "mine", label: "Posted by me" },
];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());

    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");

    const { confirm, dialog } = useConfirm();

    async function loadData() {
        try {
            setLoading(true);
            setError("");
            setNow(Date.now());

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
                setError(eventsData.error || "Could not load events.");
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
                headers: {
                    "Content-Type": "application/json",
                },
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

            await loadData();
        } catch {
            setActionError("Could not connect to the server.");
        } finally {
            setActionLoading(null);
        }
    }

    function handlePublish(eventId: string) {
        return updateStatus(eventId, "PUBLISHED", "Could not publish event.");
    }

    async function handleCancel(event: Event) {
        const confirmed = await confirm({
            title: "Cancel this event?",
            body: `"${event.title}" will be marked as cancelled for everyone who registered. This can't be undone.`,
            confirmLabel: "Cancel event",
            destructive: true,
        });

        if (!confirmed) return;

        await updateStatus(event.id, "CANCELLED", "Could not cancel event.");
    }

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const weekAhead = now + 7 * 86_400_000;

        return [...events]
            .filter((event) => {
                if (filter === "mine" && event.organizerId !== user?.id) {
                    return false;
                }
                if (filter === "week") {
                    const t = new Date(event.startTime).getTime();
                    if (t > weekAhead) return false;
                }
                if (!q) return true;
                return (
                    event.title.toLowerCase().includes(q) ||
                    event.location.toLowerCase().includes(q) ||
                    event.description.toLowerCase().includes(q)
                );
            })
            .sort(
                (a, b) =>
                    new Date(a.startTime).getTime() -
                    new Date(b.startTime).getTime()
            );
    }, [events, filter, query, now, user]);

    return (
        <>
            <Navbar />

            <main className="flex-1 px-4 py-10 sm:px-8 md:py-14">
                <div className="mx-auto max-w-7xl">
                    <PageHeader
                        eyebrow="The board"
                        title={
                            <>
                                What&apos;s <span className="mark">on</span>
                            </>
                        }
                        description="Everything published around campus, soonest first. Tap a ticket for details and to save your spot."
                        actions={
                            <Link href="/events/create" className="btn btn-primary btn-lg">
                                <PlusIcon size={18} strokeWidth={2.5} />
                                Post an event
                            </Link>
                        }
                    />

                    {/* Toolbar */}
                    {!error && (loading || events.length > 0) && (
                        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div
                                role="group"
                                aria-label="Filter events"
                                className="flex flex-wrap gap-2"
                            >
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.value}
                                        type="button"
                                        aria-pressed={filter === f.value}
                                        onClick={() => setFilter(f.value)}
                                        className={`min-h-10 rounded-full border-2 border-ink px-4 text-sm font-bold transition-colors ${
                                            filter === f.value
                                                ? "bg-ink text-card"
                                                : "bg-card hover:bg-sun-wash"
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative md:w-80">
                                <label htmlFor="event-search" className="sr-only">
                                    Search events
                                </label>
                                <SearchIcon
                                    size={18}
                                    strokeWidth={2.25}
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute"
                                />
                                <input
                                    id="event-search"
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search title, place, topic"
                                    className="field !min-h-11 pl-10"
                                />
                            </div>
                        </div>
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
                            title="Couldn't load the board"
                            action={
                                <button
                                    type="button"
                                    onClick={loadData}
                                    className="btn btn-outline btn-sm"
                                >
                                    Try again
                                </button>
                            }
                        >
                            {error}
                        </Notice>
                    )}

                    {loading && <TicketSkeletons />}

                    {!loading && !error && events.length === 0 && (
                        <EmptyState
                            icon={<CalendarIcon size={28} />}
                            eyebrow="Quiet week"
                            title="The board is empty"
                            action={
                                <Link href="/events/create" className="btn btn-signal btn-lg">
                                    Pin the first event
                                    <ArrowRightIcon size={18} strokeWidth={2.5} />
                                </Link>
                            }
                        >
                            Nothing has been published yet. Be the one who
                            gives campus something to look forward to.
                        </EmptyState>
                    )}

                    {!loading && !error && events.length > 0 && (
                        <>
                            <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute" aria-live="polite">
                                {visible.length} of {events.length}{" "}
                                {events.length === 1 ? "event" : "events"}
                            </p>

                            {visible.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-ink/40 p-10 text-center">
                                    <p className="font-display text-xl font-extrabold">
                                        Nothing matches that.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery("");
                                            setFilter("all");
                                        }}
                                        className="btn btn-outline btn-sm mt-4"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                <div className="stagger grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                                    {visible.map((event) => {
                                        const isOwner =
                                            user !== null &&
                                            event.organizerId === user.id;
                                        const busy = actionLoading === event.id;
                                        const editable =
                                            event.status !== "CANCELLED" &&
                                            event.status !== "COMPLETED";

                                        return (
                                            <EventTicket
                                                key={event.id}
                                                event={event}
                                                now={now}
                                                badges={
                                                    isOwner ? <Tag tone="sky">Yours</Tag> : null
                                                }
                                                actions={
                                                    <>
                                                        <Link
                                                            href={`/events/${event.id}`}
                                                            className="btn btn-primary btn-sm flex-1"
                                                            aria-label={`View ${event.title}`}
                                                        >
                                                            View
                                                            <ArrowRightIcon size={15} strokeWidth={2.5} />
                                                        </Link>

                                                        {isOwner && event.status === "DRAFT" && (
                                                            <button
                                                                type="button"
                                                                disabled={busy}
                                                                onClick={() => handlePublish(event.id)}
                                                                className="btn btn-signal btn-sm"
                                                            >
                                                                {busy ? (
                                                                    <SpinnerIcon size={15} />
                                                                ) : (
                                                                    <MegaphoneIcon size={15} />
                                                                )}
                                                                Publish
                                                            </button>
                                                        )}

                                                        {isOwner && editable && (
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
                        </>
                    )}
                </div>
            </main>

            {dialog}
        </>
    );
}

function TicketSkeletons() {
    return (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading events">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ticket flex h-64 overflow-hidden !shadow-none">
                    <div className="w-24 border-r-2 border-dashed border-line p-4">
                        <div className="skeleton mx-auto h-3 w-10" />
                        <div className="skeleton mx-auto mt-3 h-10 w-12" />
                        <div className="skeleton mx-auto mt-3 h-3 w-10" />
                    </div>
                    <div className="flex-1 space-y-3 p-5">
                        <div className="skeleton h-5 w-20" />
                        <div className="skeleton h-6 w-4/5" />
                        <div className="skeleton h-4 w-full" />
                        <div className="skeleton h-4 w-2/3" />
                        <div className="skeleton mt-6 h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
