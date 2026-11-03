"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
    DateStub,
    EmptyState,
    Notice,
    PageHeader,
    Tag,
    useConfirm,
} from "@/components/ui";
import {
    ArrowRightIcon,
    CheckIcon,
    ClockIcon,
    PinIcon,
    SpinnerIcon,
    TicketIcon,
} from "@/components/icons";
import { formatTimeRange, relativeDay } from "@/lib/ui/format";

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

function getBadge(registration: MyRegistration, now: number) {
    const started =
        registration.event &&
        new Date(registration.event.startTime).getTime() <= now;

    if (registration.status === "CANCELLED") {
        return { label: "You cancelled", tone: "mute" as const };
    }

    if (registration.event?.status === "CANCELLED") {
        return { label: "Event cancelled", tone: "signal" as const };
    }

    if (registration.attended) {
        return { label: "Attended", tone: "moss" as const, check: true };
    }

    if (started) {
        return { label: "Not checked in", tone: "sun" as const };
    }

    return { label: "Going", tone: "sky" as const };
}

function isUpcoming(r: MyRegistration, now: number) {
    return (
        r.status === "REGISTERED" &&
        r.event !== null &&
        r.event.status !== "CANCELLED" &&
        new Date(r.event.endTime).getTime() > now
    );
}

export default function MyRegistrationsPage() {
    const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());

    const { confirm, dialog } = useConfirm();

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
        const ok = await confirm({
            title: "Give up your spot?",
            body: `You'll lose your place at "${registration.event?.title ?? "this event"}". You can register again while spots remain.`,
            confirmLabel: "Cancel registration",
            cancelLabel: "Keep my spot",
            destructive: true,
        });

        if (!ok) {
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

    const { upcoming, past } = useMemo(() => {
        const byStart = (a: MyRegistration, b: MyRegistration) =>
            new Date(a.event?.startTime ?? 0).getTime() -
            new Date(b.event?.startTime ?? 0).getTime();
        const up = registrations.filter((r) => isUpcoming(r, now)).sort(byStart);
        const rest = registrations
            .filter((r) => !isUpcoming(r, now))
            .sort((a, b) => byStart(b, a));
        return { upcoming: up, past: rest };
    }, [registrations, now]);

    function renderRow(registration: MyRegistration, dim: boolean) {
        const badge = getBadge(registration, now);
        const event = registration.event;
        const canCancel =
            registration.status === "REGISTERED" &&
            event?.status === "PUBLISHED" &&
            new Date(event.startTime).getTime() > now;

        return (
            <li
                key={registration.id}
                className={`ticket ticket-hover flex ${dim ? "opacity-75 !shadow-[var(--shadow-hard-sm)]" : ""}`}
            >
                <div className="flex w-[5.5rem] shrink-0 items-center justify-center border-r-2 border-dashed border-ink bg-paper/60 py-4 sm:w-28">
                    {event ? (
                        <DateStub value={event.startTime} muted={dim} />
                    ) : (
                        <TicketIcon size={28} className="text-ink-mute" />
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Tag tone={badge.tone}>
                                {badge.check && <CheckIcon size={12} strokeWidth={3} />}
                                {badge.label}
                            </Tag>
                            {event && !dim && (
                                <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-mute">
                                    {relativeDay(event.startTime, now)}
                                </span>
                            )}
                        </div>

                        <Link
                            href={`/events/${registration.eventId}`}
                            className={`mt-2 block font-display text-xl font-extrabold leading-tight tracking-tight hover:underline hover:decoration-signal hover:decoration-[3px] hover:underline-offset-4 ${
                                event?.status === "CANCELLED" ? "line-through decoration-signal" : ""
                            }`}
                        >
                            {event?.title ?? "Event no longer available"}
                        </Link>

                        {event && (
                            <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                                <span className="inline-flex items-center gap-1.5">
                                    <ClockIcon size={14} />
                                    {formatTimeRange(event.startTime, event.endTime)}
                                </span>
                                <span className="inline-flex min-w-0 items-center gap-1.5">
                                    <PinIcon size={14} className="shrink-0" />
                                    <span className="truncate">{event.location}</span>
                                </span>
                            </p>
                        )}
                    </div>

                    {canCancel && (
                        <button
                            type="button"
                            onClick={() => cancel(registration)}
                            disabled={cancellingId === registration.id}
                            className="btn btn-ghost btn-sm shrink-0 self-start text-signal-deep sm:self-center"
                        >
                            {cancellingId === registration.id ? (
                                <>
                                    <SpinnerIcon size={15} />
                                    Cancelling…
                                </>
                            ) : (
                                "Can't make it"
                            )}
                        </button>
                    )}
                </div>
            </li>
        );
    }

    return (
        <>
            <Navbar />

            <main className="flex-1 px-4 py-10 sm:px-8 md:py-14">
                <div className="mx-auto max-w-4xl">
                    <PageHeader
                        eyebrow="Your wallet"
                        title={
                            <>
                                My <span className="mark">tickets</span>
                            </>
                        }
                        description="Everything you've signed up for, and whether you were checked in."
                    />

                    {error && (
                        <div className="mb-8">
                            <Notice tone="error">{error}</Notice>
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-5" aria-busy="true" aria-label="Loading tickets">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="skeleton h-32 rounded-2xl" />
                            ))}
                        </div>
                    ) : registrations.length === 0 ? (
                        <EmptyState
                            icon={<TicketIcon size={28} />}
                            eyebrow="Empty wallet"
                            title="No tickets yet"
                            action={
                                <Link href="/events" className="btn btn-signal btn-lg">
                                    Browse what&apos;s on
                                    <ArrowRightIcon size={18} strokeWidth={2.5} />
                                </Link>
                            }
                        >
                            Find something that looks fun and save a spot.
                            It&apos;ll show up right here.
                        </EmptyState>
                    ) : (
                        <div className="space-y-14">
                            <section aria-labelledby="upcoming-heading">
                                <h2
                                    id="upcoming-heading"
                                    className="mb-5 flex items-baseline gap-3 font-display text-2xl font-extrabold tracking-tight"
                                >
                                    Coming up
                                    <span className="font-mono text-sm font-semibold text-ink-mute">
                                        {upcoming.length}
                                    </span>
                                </h2>
                                {upcoming.length === 0 ? (
                                    <p className="rounded-2xl border-2 border-dashed border-ink/40 p-6 text-sm text-ink-soft">
                                        Nothing coming up.{" "}
                                        <Link href="/events" className="font-bold text-ink underline decoration-signal decoration-2 underline-offset-4">
                                            See what&apos;s on
                                        </Link>
                                    </p>
                                ) : (
                                    <ul className="stagger space-y-5">
                                        {upcoming.map((r) => renderRow(r, false))}
                                    </ul>
                                )}
                            </section>

                            {past.length > 0 && (
                                <section aria-labelledby="past-heading">
                                    <h2
                                        id="past-heading"
                                        className="mb-5 flex items-baseline gap-3 font-display text-2xl font-extrabold tracking-tight text-ink-soft"
                                    >
                                        Past & cancelled
                                        <span className="font-mono text-sm font-semibold text-ink-mute">
                                            {past.length}
                                        </span>
                                    </h2>
                                    <ul className="space-y-4">
                                        {past.map((r) => renderRow(r, true))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {dialog}
        </>
    );
}
