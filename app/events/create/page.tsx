"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import "react-day-picker/style.css";
import { BackLink, DateStub, Notice } from "@/components/ui";
import {
    ArrowRightIcon,
    ClockIcon,
    PinIcon,
    SpinnerIcon,
    UsersIcon,
} from "@/components/icons";
import { plural } from "@/lib/ui/format";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = ["00", "15", "30", "45"];

export default function CreateEventPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [startHour, setStartHour] = useState("09");
    const [startMinute, setStartMinute] = useState("00");
    const [startPeriod, setStartPeriod] = useState("AM");

    const [endDate, setEndDate] = useState<Date | undefined>();
    const [endHour, setEndHour] = useState("10");
    const [endMinute, setEndMinute] = useState("00");
    const [endPeriod, setEndPeriod] = useState("AM");

    const [capacity, setCapacity] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [checkingUser, setCheckingUser] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        async function checkUser() {
            try {
                const response = await fetch("/api/auth/me", {
                    cache: "no-store",
                });

                if (!response.ok) {
                    window.location.replace("/login");
                    return;
                }

                const data = await response.json();

                if (!data.user) {
                    window.location.replace("/login");
                    return;
                }

                setAuthorized(true);
            } catch {
                setError("Could not verify your account.");
            } finally {
                setCheckingUser(false);
            }
        }

        checkUser();
    }, []);

    function convertTo24Hour(hour: string, period: string): number {
        let hourNumber = Number(hour);

        if (period === "AM") {
            if (hourNumber === 12) {
                hourNumber = 0;
            }
        } else if (hourNumber !== 12) {
            hourNumber += 12;
        }

        return hourNumber;
    }

    function createDateTime(
        date: Date | undefined,
        hour: string,
        minute: string,
        period: string
    ): Date | null {
        if (!date) {
            return null;
        }

        const result = new Date(date);

        result.setHours(convertTo24Hour(hour, period), Number(minute), 0, 0);

        return result;
    }

    function formatSelectedDateTime(
        date: Date | undefined,
        hour: string,
        minute: string,
        period: string
    ) {
        const dateTime = createDateTime(date, hour, minute, period);

        if (!dateTime) {
            return "Pick a date above";
        }

        return format(dateTime, "EEE d MMM yyyy 'at' h:mm a");
    }

    function handleStartSelect(date: Date | undefined) {
        setStartDate(date);
        // Most events finish the same day — pre-fill the end date.
        if (date && (!endDate || endDate < date)) {
            setEndDate(date);
        }
    }

    async function handleCreateEvent(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const startDateTime = createDateTime(
            startDate,
            startHour,
            startMinute,
            startPeriod
        );

        const endDateTime = createDateTime(endDate, endHour, endMinute, endPeriod);

        if (!startDateTime || !endDateTime) {
            setError("Please select both a start date/time and an end date/time.");
            return;
        }

        const now = new Date();

        if (startDateTime <= now) {
            setError("The event start time must be in the future.");
            return;
        }

        if (endDateTime <= startDateTime) {
            setError("The event end time must be after the start time.");
            return;
        }

        if (!capacity || Number(capacity) < 1) {
            setError("Capacity must be at least 1.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
                body: JSON.stringify({
                    title,
                    description,
                    location,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    capacity,
                }),
            });

            if (response.status === 401) {
                window.location.replace("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Could not create event.");
                return;
            }

            setSuccess(title);

            setTitle("");
            setDescription("");
            setLocation("");
            setStartDate(undefined);
            setEndDate(undefined);
            setStartHour("09");
            setStartMinute("00");
            setStartPeriod("AM");
            setEndHour("10");
            setEndMinute("00");
            setEndPeriod("AM");
            setCapacity("");
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    if (checkingUser) {
        return (
            <>
                <Navbar />
                <main className="flex-1 px-4 py-10 sm:px-8" aria-busy="true">
                    <div className="mx-auto max-w-6xl space-y-4">
                        <div className="skeleton h-5 w-28" />
                        <div className="skeleton h-14 w-80" />
                        <div className="skeleton mt-8 h-[28rem] w-full rounded-2xl" />
                    </div>
                </main>
            </>
        );
    }

    if (!authorized) {
        return (
            <>
                <Navbar />
                <main className="flex-1 px-4 py-10 sm:px-8">
                    <div className="mx-auto max-w-2xl">
                        <BackLink href="/events">All events</BackLink>
                        <div className="mt-6">
                            <Notice tone="error" title="Can't create an event right now">
                                {error || "You must be logged in to create events."}
                            </Notice>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    const today = startOfDay(new Date());

    const previewStart = createDateTime(startDate, startHour, startMinute, startPeriod);
    const previewEnd = createDateTime(endDate, endHour, endMinute, endPeriod);

    return (
        <>
            <Navbar />

            <main className="flex-1 px-4 pb-20 pt-6 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <BackLink href="/events">All events</BackLink>

                    <header className="mb-10 mt-6">
                        <p className="eyebrow">New listing</p>
                        <h1 className="display mt-3 text-5xl sm:text-6xl">
                            Pin up an <span className="mark">event</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-lg leading-8 text-ink-soft">
                            It&apos;s saved as a draft first. Nobody sees it
                            until you hit publish.
                        </p>
                    </header>

                    {success && (
                        <div className="mb-8">
                            <Notice
                                tone="success"
                                title={`“${success}” is saved as a draft`}
                                action={
                                    <Link href="/events/my-events" className="btn btn-primary btn-sm">
                                        Review & publish
                                        <ArrowRightIcon size={15} strokeWidth={2.5} />
                                    </Link>
                                }
                            >
                                Head to your hosting desk to publish it when
                                you&apos;re ready, or post another below.
                            </Notice>
                        </div>
                    )}

                    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
                        <form onSubmit={handleCreateEvent} className="space-y-8">
                            <Step n="1" title="The basics" hint="What is it, and where?">
                                <div>
                                    <label htmlFor="event-title" className="field-label">
                                        Event title
                                    </label>
                                    <input
                                        id="event-title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Intro to screen printing"
                                        required
                                        maxLength={120}
                                        className="field font-display text-lg font-bold"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="event-description" className="field-label">
                                        Description
                                    </label>
                                    <textarea
                                        id="event-description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What will people do, learn or get out of it? Anything to bring?"
                                        required
                                        rows={5}
                                        className="field resize-y"
                                        aria-describedby="desc-hint"
                                    />
                                    <p id="desc-hint" className="field-hint">
                                        Two or three sentences is plenty.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="event-location" className="field-label">
                                        Location
                                    </label>
                                    <input
                                        id="event-location"
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. Art Block, Studio 2"
                                        required
                                        className="field"
                                    />
                                </div>
                            </Step>

                            <Step n="2" title="When" hint="Pick a start, then an end.">
                                <div className="grid gap-6 xl:grid-cols-2">
                                    <WhenPicker
                                        label="Starts"
                                        idPrefix="start"
                                        date={startDate}
                                        onDate={handleStartSelect}
                                        disabledBefore={today}
                                        hour={startHour}
                                        minute={startMinute}
                                        period={startPeriod}
                                        onHour={setStartHour}
                                        onMinute={setStartMinute}
                                        onPeriod={setStartPeriod}
                                        summary={formatSelectedDateTime(
                                            startDate,
                                            startHour,
                                            startMinute,
                                            startPeriod
                                        )}
                                    />
                                    <WhenPicker
                                        label="Ends"
                                        idPrefix="end"
                                        date={endDate}
                                        onDate={setEndDate}
                                        disabledBefore={startDate || today}
                                        hour={endHour}
                                        minute={endMinute}
                                        period={endPeriod}
                                        onHour={setEndHour}
                                        onMinute={setEndMinute}
                                        onPeriod={setEndPeriod}
                                        summary={formatSelectedDateTime(
                                            endDate,
                                            endHour,
                                            endMinute,
                                            endPeriod
                                        )}
                                    />
                                </div>
                            </Step>

                            <Step n="3" title="Head count" hint="How many people can you fit?">
                                <div className="max-w-xs">
                                    <label htmlFor="event-capacity" className="field-label">
                                        Capacity
                                    </label>
                                    <input
                                        id="event-capacity"
                                        type="number"
                                        inputMode="numeric"
                                        value={capacity}
                                        onChange={(e) => setCapacity(e.target.value)}
                                        placeholder="e.g. 40"
                                        min="1"
                                        required
                                        className="field"
                                        aria-describedby="cap-hint"
                                    />
                                    <p id="cap-hint" className="field-hint">
                                        Registration stops once this many people sign up.
                                    </p>
                                </div>
                            </Step>

                            {error && (
                                <Notice tone="error" title="Couldn't create the event">
                                    {error}
                                </Notice>
                            )}

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <Link href="/events" className="btn btn-ghost btn-lg">
                                    Discard
                                </Link>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary btn-lg"
                                >
                                    {loading ? (
                                        <>
                                            <SpinnerIcon size={18} />
                                            Saving draft…
                                        </>
                                    ) : (
                                        <>
                                            Save as draft
                                            <ArrowRightIcon size={18} strokeWidth={2.5} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Live preview */}
                        <aside className="hidden lg:block" aria-label="Preview">
                            <div className="sticky top-24">
                                <p className="eyebrow mb-4">Live preview</p>
                                <div className="ticket flex rotate-1">
                                    <div className="flex w-24 shrink-0 items-center justify-center border-r-2 border-dashed border-ink bg-paper/60 py-6">
                                        {previewStart ? (
                                            <DateStub value={previewStart.toISOString()} />
                                        ) : (
                                            <span className="font-display text-4xl font-extrabold text-line">
                                                ?
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1 p-5">
                                        <span className="inline-flex rounded-md border-[1.5px] border-dashed border-ink bg-sun-wash px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em]">
                                            Draft
                                        </span>
                                        <p
                                            className={`mt-3 break-words font-display text-xl font-extrabold leading-tight ${
                                                title ? "" : "text-ink-mute"
                                            }`}
                                        >
                                            {title || "Your event title"}
                                        </p>
                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">
                                            {description || "A short description will appear here."}
                                        </p>
                                        <ul className="mt-4 space-y-1.5 text-sm">
                                            <li className="flex items-center gap-2">
                                                <ClockIcon size={15} className="text-ink-mute" />
                                                {previewStart
                                                    ? `${format(previewStart, "h:mm a")}${
                                                          previewEnd ? ` – ${format(previewEnd, "h:mm a")}` : ""
                                                      }`
                                                    : "Time TBC"}
                                            </li>
                                            <li className="flex min-w-0 items-center gap-2">
                                                <PinIcon size={15} className="shrink-0 text-ink-mute" />
                                                <span className="truncate">{location || "Location TBC"}</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <UsersIcon size={15} className="text-ink-mute" />
                                                {Number(capacity) > 0
                                                    ? plural(Number(capacity), "spot")
                                                    : "Capacity TBC"}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <p className="mt-6 text-sm leading-6 text-ink-mute">
                                    This is roughly how it&apos;ll look on the
                                    board once published.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

function Step({
    n,
    title,
    hint,
    children,
}: {
    n: string;
    title: string;
    hint: string;
    children: ReactNode;
}) {
    return (
        <fieldset className="panel p-6 sm:p-8">
            <legend className="sr-only">{title}</legend>
            <div className="mb-7 flex items-center gap-4" aria-hidden="true">
                <span className="flex h-11 w-11 -rotate-6 items-center justify-center rounded-xl border-2 border-ink bg-sun font-display text-xl font-extrabold">
                    {n}
                </span>
                <div>
                    <p className="font-display text-2xl font-extrabold leading-none tracking-tight">
                        {title}
                    </p>
                    <p className="mt-1 text-sm text-ink-mute">{hint}</p>
                </div>
            </div>
            <div className="space-y-6">{children}</div>
        </fieldset>
    );
}

function WhenPicker({
    label,
    idPrefix,
    date,
    onDate,
    disabledBefore,
    hour,
    minute,
    period,
    onHour,
    onMinute,
    onPeriod,
    summary,
}: {
    label: string;
    idPrefix: string;
    date: Date | undefined;
    onDate: (d: Date | undefined) => void;
    disabledBefore: Date;
    hour: string;
    minute: string;
    period: string;
    onHour: (v: string) => void;
    onMinute: (v: string) => void;
    onPeriod: (v: string) => void;
    summary: string;
}) {
    return (
        <div className="rounded-2xl border-2 border-ink bg-paper/50 p-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-signal-deep">
                {label}
            </p>

            <div className="mt-2 overflow-x-auto">
                <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={onDate}
                    disabled={{ before: disabledBefore }}
                    defaultMonth={date || disabledBefore}
                />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                    <label htmlFor={`${idPrefix}-hour`} className="eyebrow mb-1.5 block !text-[0.65rem]">
                        Hour
                    </label>
                    <select
                        id={`${idPrefix}-hour`}
                        value={hour}
                        onChange={(e) => onHour(e.target.value)}
                        className="field !min-h-11 !px-3 !py-2"
                    >
                        {HOURS.map((h) => (
                            <option key={h} value={h}>
                                {h}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-minute`} className="eyebrow mb-1.5 block !text-[0.65rem]">
                        Min
                    </label>
                    <select
                        id={`${idPrefix}-minute`}
                        value={minute}
                        onChange={(e) => onMinute(e.target.value)}
                        className="field !min-h-11 !px-3 !py-2"
                    >
                        {MINUTES.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor={`${idPrefix}-period`} className="eyebrow mb-1.5 block !text-[0.65rem]">
                        AM/PM
                    </label>
                    <select
                        id={`${idPrefix}-period`}
                        value={period}
                        onChange={(e) => onPeriod(e.target.value)}
                        className="field !min-h-11 !px-3 !py-2"
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                </div>
            </div>

            <p className="mt-3 rounded-lg bg-card px-3 py-2 text-sm font-semibold" aria-live="polite">
                {summary}
            </p>
        </div>
    );
}
