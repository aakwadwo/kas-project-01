"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
    BackLink,
    DateStub,
    Notice,
    StatusStamp,
    Tag,
    useConfirm,
} from "@/components/ui";
import {
    AlertIcon,
    ArrowRightIcon,
    CalendarIcon,
    CheckIcon,
    ClockIcon,
    InfoIcon,
    PinIcon,
    SpinnerIcon,
    TicketIcon,
    UsersIcon,
} from "@/components/icons";
import {
    formatLongDate,
    formatTimeRange,
    plural,
    relativeDay,
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
    const [registration, setRegistration] = useState<Registration | null>(null);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState("");
    const [eventExpired, setEventExpired] = useState(false);
    const [justRegistered, setJustRegistered] = useState(false);

    const { confirm, dialog } = useConfirm();

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

            const eventResponse = await fetch(`/api/events/${eventId}`, {
                cache: "no-store",
            });

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
                setError(eventData.error || "Could not load event.");
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

            const registrationData = await registrationResponse.json();

            if (registrationResponse.ok) {
                setRegistration(registrationData.registration || null);
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
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, [eventId]);

    async function handleRegister() {
        try {
            setRegistering(true);
            setError("");

            const response = await fetch(`/api/registrations/${eventId}`, {
                method: "POST",
                cache: "no-store",
            });

            const data = await response.json();

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            if (!response.ok) {
                setError(data.error || "Could not register for event.");
                return;
            }

            setRegistration(data.registration);
            setJustRegistered(true);
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setRegistering(false);
        }
    }

    async function handleCancelRegistration() {
        const confirmed = await confirm({
            title: "Give up your spot?",
            body: "Your place will be released for someone else. You can register again while spots remain.",
            confirmLabel: "Cancel registration",
            cancelLabel: "Keep my spot",
            destructive: true,
        });

        if (!confirmed) {
            return;
        }

        try {
            setRegistering(true);
            setError("");
            setJustRegistered(false);

            const response = await fetch(`/api/registrations/${eventId}`, {
                method: "DELETE",
                cache: "no-store",
            });

            const data = await response.json();

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            if (!response.ok) {
                setError(data.error || "Could not cancel registration.");
                return;
            }

            setRegistration(data.registration);
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setRegistering(false);
        }
    }

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="flex-1 px-4 py-8 sm:px-8" aria-busy="true">
                    <div className="mx-auto max-w-7xl">
                        <div className="skeleton h-5 w-36" />
                        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
                            <div className="space-y-4">
                                <div className="skeleton h-6 w-28" />
                                <div className="skeleton h-16 w-4/5" />
                                <div className="skeleton h-16 w-3/5" />
                                <div className="skeleton mt-8 h-40 w-full" />
                            </div>
                            <div className="skeleton h-96 rounded-2xl" />
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
                <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
                    <div className="panel w-full max-w-xl overflow-hidden text-center">
                        <div className="dot-grid border-b-2 border-ink bg-paper-deep px-6 py-12">
                            <div className="mx-auto flex h-16 w-16 rotate-6 items-center justify-center rounded-2xl border-2 border-ink bg-card shadow-[var(--shadow-hard-sm)]">
                                <ClockIcon size={30} />
                            </div>
                            <p className="eyebrow mt-6">Event over</p>
                            <h1 className="display mt-2 text-4xl sm:text-5xl">
                                You just missed it.
                            </h1>
                            <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-ink-soft">
                                This event started more than an hour ago, so
                                it&apos;s been taken off the board.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 p-6">
                            <Link href="/events" className="btn btn-primary">
                                See what&apos;s on now
                            </Link>
                            <Link href="/events/my-events" className="btn btn-outline">
                                Hosting
                            </Link>
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
                <main className="flex-1 px-4 py-10 sm:px-8">
                    <div className="mx-auto max-w-2xl">
                        <BackLink href="/events">All events</BackLink>
                        <div className="mt-6">
                            <Notice
                                tone="error"
                                title="Couldn't load this event"
                                action={
                                    <div className="flex flex-wrap gap-2">
                                        <button type="button" onClick={loadEvent} className="btn btn-primary btn-sm">
                                            Try again
                                        </button>
                                        <Link href="/events" className="btn btn-outline btn-sm">
                                            Back to the board
                                        </Link>
                                    </div>
                                }
                            >
                                {error}
                            </Notice>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!event) {
        return null;
    }

    const isOwner = currentUserId === event.organizerId;
    const isRegistered = registration?.status === "REGISTERED";
    const eventHasStarted = new Date(event.startTime).getTime() <= Date.now();
    const canRegister =
        !isOwner && event.status === "PUBLISHED" && !eventHasStarted;
    const registrationOpen = event.status === "PUBLISHED" && !eventHasStarted;

    return (
        <>
            <Navbar />

            <main className="flex-1 px-4 pb-20 pt-6 sm:px-8">
                <div className="mx-auto max-w-7xl">
                    <BackLink href="/events">All events</BackLink>

                    <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
                        {/* Left column */}
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusStamp status={event.status} />
                                {isOwner && <Tag tone="sky">You&apos;re hosting</Tag>}
                                {isRegistered && !isOwner && (
                                    <Tag tone="moss">
                                        <CheckIcon size={12} strokeWidth={3} />
                                        Going
                                    </Tag>
                                )}
                                {!eventHasStarted && event.status === "PUBLISHED" && (
                                    <Tag tone="mute">{relativeDay(event.startTime)}</Tag>
                                )}
                            </div>

                            <h1
                                className={`display mt-5 break-words text-5xl sm:text-6xl lg:text-7xl ${
                                    event.status === "CANCELLED"
                                        ? "line-through decoration-signal decoration-[6px]"
                                        : ""
                                }`}
                            >
                                {event.title}
                            </h1>

                            {/* Fact strip */}
                            <dl className="mt-10 grid overflow-hidden rounded-2xl border-2 border-ink bg-card sm:grid-cols-2">
                                {[
                                    {
                                        Icon: CalendarIcon,
                                        label: "Date",
                                        value: formatLongDate(event.startTime),
                                    },
                                    {
                                        Icon: ClockIcon,
                                        label: "Time",
                                        value: formatTimeRange(event.startTime, event.endTime),
                                    },
                                    {
                                        Icon: PinIcon,
                                        label: "Where",
                                        value: event.location,
                                    },
                                    {
                                        Icon: UsersIcon,
                                        label: "Capacity",
                                        value: plural(event.capacity, "spot"),
                                    },
                                ].map(({ Icon, label, value }, i) => (
                                    <div
                                        key={label}
                                        className={`flex gap-4 border-ink p-5 ${
                                            i > 0 ? "border-t-2" : ""
                                        } ${i < 2 ? "sm:border-t-0" : ""} ${
                                            i % 2 === 1 ? "sm:border-l-2" : ""
                                        }`}
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-deep">
                                            <Icon size={19} />
                                        </span>
                                        <div className="min-w-0">
                                            <dt className="eyebrow !text-[0.68rem]">{label}</dt>
                                            <dd className="mt-1 break-words font-semibold leading-6">
                                                {value}
                                            </dd>
                                        </div>
                                    </div>
                                ))}
                            </dl>

                            {/* Description */}
                            <section className="mt-12" aria-labelledby="about-heading">
                                <h2 id="about-heading" className="eyebrow">
                                    About this event
                                </h2>
                                <p className="mt-4 max-w-[68ch] whitespace-pre-wrap text-[1.05rem] leading-8 text-ink first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.8] first-letter:text-signal">
                                    {event.description}
                                </p>
                            </section>
                        </div>

                        {/* Admit-one stub */}
                        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Registration">
                            <div className="ticket overflow-hidden">
                                <div className="flex items-center justify-between bg-ink px-5 py-3 text-card">
                                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em]">
                                        Admit one
                                    </span>
                                    <TicketIcon size={18} className="text-sun" />
                                </div>

                                <div className="flex items-center gap-5 p-5">
                                    <DateStub
                                        value={event.startTime}
                                        className="w-20 shrink-0 rounded-xl border-2 border-ink bg-paper py-3"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-display text-lg font-extrabold leading-tight">
                                            {formatTimeRange(event.startTime, event.endTime)}
                                        </p>
                                        <p className="mt-1 truncate text-sm text-ink-soft">
                                            {event.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="perf-x p-5" aria-live="polite">
                                    {isOwner ? (
                                        <>
                                            <h2 className="font-display text-xl font-extrabold">
                                                This one&apos;s yours
                                            </h2>
                                            <p className="mt-1 text-sm leading-6 text-ink-soft">
                                                See who&apos;s registered and manage
                                                details from your hosting desk.
                                            </p>
                                            <Link href="/events/my-events" className="btn btn-primary mt-5 w-full">
                                                Open hosting desk
                                                <ArrowRightIcon size={16} strokeWidth={2.5} />
                                            </Link>
                                        </>
                                    ) : isRegistered ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-11 w-11 -rotate-6 items-center justify-center rounded-xl border-2 border-ink bg-moss text-white">
                                                    <CheckIcon size={22} strokeWidth={3} />
                                                </span>
                                                <div>
                                                    <h2 className="font-display text-xl font-extrabold">
                                                        {justRegistered ? "You're on the list!" : "You're going"}
                                                    </h2>
                                                    <p className="text-sm text-ink-soft">
                                                        Your spot is saved.
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href="/registrations" className="btn btn-outline mt-5 w-full">
                                                View my tickets
                                            </Link>
                                            {registrationOpen && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelRegistration}
                                                    disabled={registering}
                                                    className="btn btn-ghost mt-2 w-full text-signal-deep"
                                                >
                                                    {registering ? (
                                                        <>
                                                            <SpinnerIcon size={16} />
                                                            Releasing spot…
                                                        </>
                                                    ) : (
                                                        "Can't make it? Cancel"
                                                    )}
                                                </button>
                                            )}
                                        </>
                                    ) : canRegister ? (
                                        <>
                                            <h2 className="font-display text-xl font-extrabold">
                                                Want in?
                                            </h2>
                                            <p className="mt-1 text-sm leading-6 text-ink-soft">
                                                {plural(event.capacity, "spot")} in
                                                total. Registration closes when it
                                                starts.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleRegister}
                                                disabled={registering}
                                                className="btn btn-signal btn-lg mt-5 w-full"
                                            >
                                                {registering ? (
                                                    <>
                                                        <SpinnerIcon size={18} />
                                                        Saving your spot…
                                                    </>
                                                ) : (
                                                    <>
                                                        Save my spot
                                                        <ArrowRightIcon size={18} strokeWidth={2.5} />
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-deep">
                                                <InfoIcon size={18} />
                                            </span>
                                            <div>
                                                <h2 className="font-bold">Registration closed</h2>
                                                <p className="mt-1 text-sm leading-6 text-ink-soft">
                                                    {event.status !== "PUBLISHED"
                                                        ? "Only published events take registrations."
                                                        : eventHasStarted
                                                          ? "This event has already started."
                                                          : "Registration isn't available for this event."}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="mt-4 flex gap-2 rounded-xl border-2 border-signal-deep bg-signal-wash p-3 text-sm text-ink" role="alert">
                                            <AlertIcon size={18} className="mt-0.5 shrink-0 text-signal-deep" />
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {!isOwner && registrationOpen && (
                                    <div className="flex items-center justify-center gap-2 border-t-2 border-ink bg-moss-wash px-5 py-2.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-moss">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-moss" />
                                        Registration open
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {dialog}
        </>
    );
}
