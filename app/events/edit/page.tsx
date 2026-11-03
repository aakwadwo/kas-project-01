"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BackLink, Notice, StatusStamp } from "@/components/ui";
import { InfoIcon, SpinnerIcon } from "@/components/icons";
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

function EditEventForm() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get("id");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [capacity, setCapacity] = useState("");

    const [eventStatus, setEventStatus] = useState<EventStatus | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [authorized, setAuthorized] = useState(false);

    function formatDateTimeForInput(dateString: string) {
        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    async function loadEvent() {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const meResponse = await fetch("/api/auth/me", {
                cache: "no-store",
            });

            if (!meResponse.ok) {
                window.location.replace("/login");
                return;
            }

            const meData = await meResponse.json();

            if (!meData.user) {
                window.location.replace("/login");
                return;
            }

            if (!eventId) {
                setError("Event ID is missing.");
                return;
            }

            const response = await fetch(`/api/events/${eventId}`, {
                cache: "no-store",
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Could not load this event.");
                return;
            }

            const event: Event = data.event;

            if (event.status === "CANCELLED") {
                setEventStatus("CANCELLED");
                setError("This event has been cancelled and cannot be edited.");
                return;
            }

            if (event.status === "COMPLETED") {
                setEventStatus("COMPLETED");
                setError("This event has been completed and cannot be edited.");
                return;
            }

            setEventStatus(event.status);

            setTitle(event.title);
            setDescription(event.description);
            setLocation(event.location);

            setStartTime(formatDateTimeForInput(event.startTime));

            setEndTime(formatDateTimeForInput(event.endTime));

            setCapacity(String(event.capacity));

            setAuthorized(true);
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadEvent();

        function handlePageShow(event: PageTransitionEvent) {
            if (event.persisted) {
                loadEvent();
            }
        }

        window.addEventListener("pageshow", handlePageShow);

        return () => {
            window.removeEventListener("pageshow", handlePageShow);
        };
    }, [eventId]);

    async function handleUpdateEvent(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!eventId) {
            setError("Event ID is missing.");
            return;
        }

        if (eventStatus === "CANCELLED" || eventStatus === "COMPLETED") {
            setError("This event cannot be edited.");
            return;
        }

        setSaving(true);

        try {
            const response = await fetch("/api/events", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
                body: JSON.stringify({
                    id: eventId,
                    title,
                    description,
                    location,
                    startTime,
                    endTime,
                    capacity,
                }),
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Could not update event.");
                return;
            }

            setSuccess("Your event has been updated successfully.");
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <EditSkeleton />;
    }

    if (!authorized) {
        return (
            <>
                <Navbar />
                <main className="flex-1 px-4 py-10 sm:px-8">
                    <div className="mx-auto max-w-2xl">
                        <BackLink href="/events/my-events">Hosting desk</BackLink>
                        <div className="mt-6">
                            <Notice
                                tone="error"
                                title="This event can't be edited"
                                action={
                                    <div className="flex flex-wrap gap-2">
                                        <Link href="/events/my-events" className="btn btn-primary btn-sm">
                                            Back to hosting
                                        </Link>
                                        <Link href="/events" className="btn btn-outline btn-sm">
                                            All events
                                        </Link>
                                    </div>
                                }
                            >
                                {error || "You do not have permission to edit this event."}
                            </Notice>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="flex-1 px-4 pb-20 pt-6 sm:px-8">
                <div className="mx-auto max-w-3xl">
                    <BackLink href="/events/my-events">Hosting desk</BackLink>

                    <header className="mb-10 mt-6">
                        <div className="flex items-center gap-3">
                            <p className="eyebrow">Editing</p>
                            {eventStatus && <StatusStamp status={eventStatus} />}
                        </div>
                        <h1 className="display mt-3 break-words text-5xl sm:text-6xl">
                            {title || "Untitled event"}
                        </h1>
                    </header>

                    <form onSubmit={handleUpdateEvent} className="space-y-8">
                        <Section title="The basics">
                            <div>
                                <label htmlFor="title" className="field-label">
                                    Event title
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    maxLength={120}
                                    className="field font-display text-lg font-bold"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="field-label">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={6}
                                    className="field resize-y"
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="field-label">
                                    Location
                                </label>
                                <input
                                    id="location"
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                    className="field"
                                />
                            </div>
                        </Section>

                        <Section title="When & how many">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="startTime" className="field-label">
                                        Starts
                                    </label>
                                    <input
                                        id="startTime"
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                        className="field"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endTime" className="field-label">
                                        Ends
                                    </label>
                                    <input
                                        id="endTime"
                                        type="datetime-local"
                                        value={endTime}
                                        min={startTime || undefined}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                        className="field"
                                    />
                                </div>
                            </div>

                            <div className="max-w-xs">
                                <label htmlFor="capacity" className="field-label">
                                    Capacity
                                </label>
                                <input
                                    id="capacity"
                                    type="number"
                                    inputMode="numeric"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    min="1"
                                    required
                                    className="field"
                                />
                            </div>
                        </Section>

                        <div className="flex gap-3 rounded-xl border-2 border-dashed border-ink/40 p-4 text-sm leading-6 text-ink-soft">
                            <InfoIcon size={18} className="mt-0.5 shrink-0 text-ink" />
                            <p>
                                Changing the time or place? People who already
                                registered won&apos;t be notified automatically,
                                so give them a heads-up.
                            </p>
                        </div>

                        {error && (
                            <Notice tone="error" title="Update failed">
                                {error}
                            </Notice>
                        )}

                        {success && (
                            <Notice
                                tone="success"
                                title="Saved"
                                action={
                                    <Link href={`/events/${eventId}`} className="btn btn-outline btn-sm">
                                        View event
                                    </Link>
                                }
                            >
                                {success}
                            </Notice>
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Link href="/events/my-events" className="btn btn-ghost btn-lg">
                                Cancel
                            </Link>
                            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
                                {saving ? (
                                    <>
                                        <SpinnerIcon size={18} />
                                        Saving…
                                    </>
                                ) : (
                                    "Save changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <fieldset className="panel p-6 sm:p-8">
            <legend className="sr-only">{title}</legend>
            <p className="mb-6 font-display text-2xl font-extrabold tracking-tight" aria-hidden="true">
                {title}
            </p>
            <div className="space-y-6">{children}</div>
        </fieldset>
    );
}

function EditSkeleton() {
    return (
        <>
            <Navbar />
            <main className="flex-1 px-4 py-10 sm:px-8" aria-busy="true">
                <div className="mx-auto max-w-3xl space-y-4">
                    <div className="skeleton h-5 w-28" />
                    <div className="skeleton h-14 w-3/4" />
                    <div className="skeleton mt-8 h-[30rem] w-full rounded-2xl" />
                </div>
            </main>
        </>
    );
}

export default function EditEventPage() {
    return (
        <Suspense fallback={<EditSkeleton />}>
            <EditEventForm />
        </Suspense>
    );
}
