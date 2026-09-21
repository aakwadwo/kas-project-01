"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { DayPicker } from "react-day-picker";
import { format, startOfDay } from "date-fns";
import "react-day-picker/style.css";

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

    function convertTo24Hour(
        hour: string,
        period: string
    ): number {
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

        result.setHours(
            convertTo24Hour(hour, period),
            Number(minute),
            0,
            0
        );

        return result;
    }

    function formatSelectedDateTime(
        date: Date | undefined,
        hour: string,
        minute: string,
        period: string
    ) {
        const dateTime = createDateTime(
            date,
            hour,
            minute,
            period
        );

        if (!dateTime) {
            return "Select date and time";
        }

        return format(
            dateTime,
            "EEEE, MMMM d, yyyy 'at' h:mm a"
        );
    }

    async function handleCreateEvent(
        event: React.FormEvent
    ) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const startDateTime = createDateTime(
            startDate,
            startHour,
            startMinute,
            startPeriod
        );

        const endDateTime = createDateTime(
            endDate,
            endHour,
            endMinute,
            endPeriod
        );

        if (!startDateTime || !endDateTime) {
            setError(
                "Please select both a start date/time and an end date/time."
            );
            return;
        }

        const now = new Date();

        if (startDateTime <= now) {
            setError(
                "The event start time must be in the future."
            );
            return;
        }

        if (endDateTime <= startDateTime) {
            setError(
                "The event end time must be after the start time."
            );
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
                setError(
                    data.error || "Could not create event."
                );
                return;
            }

            setSuccess(
                "Event created successfully. You can now find it in My Events."
            );

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

                <main className="min-h-screen bg-gray-50 px-5 py-12 sm:px-8">
                    <div className="mx-auto max-w-3xl animate-pulse">
                        <div className="h-4 w-28 rounded bg-gray-200" />

                        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                            <div className="h-10 w-64 rounded-lg bg-gray-200" />
                            <div className="mt-4 h-5 w-96 max-w-full rounded bg-gray-200" />

                            <div className="mt-10 space-y-7">
                                <div>
                                    <div className="h-4 w-28 rounded bg-gray-200" />
                                    <div className="mt-3 h-12 rounded-xl bg-gray-200" />
                                </div>

                                <div>
                                    <div className="h-4 w-24 rounded bg-gray-200" />
                                    <div className="mt-3 h-32 rounded-xl bg-gray-200" />
                                </div>

                                <div>
                                    <div className="h-4 w-24 rounded bg-gray-200" />
                                    <div className="mt-3 h-12 rounded-xl bg-gray-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    if (!authorized) {
        return (
            <>
                <Navbar />

                <main className="min-h-screen bg-gray-50 px-5 py-12 sm:px-8">
                    <div className="mx-auto max-w-2xl">
                        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 font-bold text-red-600">
                                !
                            </div>

                            <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-950">
                                Unable to create an event
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-red-600">
                                {error ||
                                    "You must be logged in to create events."}
                            </p>

                            <Link
                                href="/events"
                                className="mt-6 inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                            >
                                ← Back to Events
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    const today = startOfDay(new Date());

    const inputClass =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10";

    const selectClass =
        "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10";

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8 md:py-14">
                <div className="mx-auto max-w-3xl">

                    {/* Back link */}
                    <Link
                        href="/events"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950"
                    >
                        <span>←</span>
                        Back to Events
                    </Link>

                    {/* Header */}
                    <div className="mt-8 mb-8">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                            Event Management
                        </p>

                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                            Create an event
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                            Add the details below to create an event for
                            your campus community.
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <form
                            onSubmit={handleCreateEvent}
                            className="divide-y divide-gray-100"
                        >
                            {/* Basic information */}
                            <section className="p-6 sm:p-8">
                                <div className="mb-7">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-950 text-sm font-bold text-white">
                                            1
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-bold text-gray-950">
                                                Basic information
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                Tell people what your event is
                                                about.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label
                                            htmlFor="event-title"
                                            className="mb-2 block text-sm font-semibold text-gray-800"
                                        >
                                            Event title
                                        </label>

                                        <input
                                            id="event-title"
                                            type="text"
                                            value={title}
                                            onChange={(event) =>
                                                setTitle(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="e.g. Tech Innovation Conference"
                                            required
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label
                                            htmlFor="event-description"
                                            className="mb-2 block text-sm font-semibold text-gray-800"
                                        >
                                            Description
                                        </label>

                                        <textarea
                                            id="event-description"
                                            value={description}
                                            onChange={(event) =>
                                                setDescription(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Describe what attendees can expect from the event..."
                                            required
                                            rows={5}
                                            className={`${inputClass} resize-y`}
                                        />

                                        <p className="mt-2 text-xs text-gray-400">
                                            Give attendees enough information
                                            to understand the purpose of the
                                            event.
                                        </p>
                                    </div>

                                    {/* Location */}
                                    <div>
                                        <label
                                            htmlFor="event-location"
                                            className="mb-2 block text-sm font-semibold text-gray-800"
                                        >
                                            Location
                                        </label>

                                        <input
                                            id="event-location"
                                            type="text"
                                            value={location}
                                            onChange={(event) =>
                                                setLocation(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="e.g. Academic City Auditorium"
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Schedule */}
                            <section className="p-6 sm:p-8">
                                <div className="mb-7">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-950 text-sm font-bold text-white">
                                            2
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-bold text-gray-950">
                                                Event schedule
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                Choose when your event starts
                                                and ends.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-7">
                                    {/* Start */}
                                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                                        <div className="mb-5">
                                            <p className="text-sm font-bold text-gray-950">
                                                Start date & time
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                                Choose when your event begins.
                                            </p>
                                        </div>

                                        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-3">
                                            <DayPicker
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                disabled={{
                                                    before: today,
                                                }}
                                                defaultMonth={
                                                    startDate || today
                                                }
                                            />
                                        </div>

                                        <div className="mt-5 grid grid-cols-3 gap-3">
                                            <div>
                                                <label
                                                    htmlFor="start-hour"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                                                >
                                                    Hour
                                                </label>

                                                <select
                                                    id="start-hour"
                                                    value={startHour}
                                                    onChange={(event) =>
                                                        setStartHour(
                                                            event.target.value
                                                        )
                                                    }
                                                    className={selectClass}
                                                >
                                                    {Array.from(
                                                        { length: 12 },
                                                        (_, index) => {
                                                            const hour =
                                                                String(
                                                                    index + 1
                                                                ).padStart(
                                                                    2,
                                                                    "0"
                                                                );

                                                            return (
                                                                <option
                                                                    key={hour}
                                                                    value={hour}
                                                                >
                                                                    {hour}
                                                                </option>
                                                            );
                                                        }
                                                    )}
                                                </select>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="start-minute"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                                                >
                                                    Minute
                                                </label>

                                                <select
                                                    id="start-minute"
                                                    value={startMinute}
                                                    onChange={(event) =>
                                                        setStartMinute(
                                                            event.target.value
                                                        )
                                                    }
                                                    className={selectClass}
                                                >
                                                    {[
                                                        "00",
                                                        "15",
                                                        "30",
                                                        "45",
                                                    ].map((minute) => (
                                                        <option
                                                            key={minute}
                                                            value={minute}
                                                        >
                                                            {minute}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="start-period"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                                                >
                                                    Period
                                                </label>

                                                <select
                                                    id="start-period"
                                                    value={startPeriod}
                                                    onChange={(event) =>
                                                        setStartPeriod(
                                                            event.target.value
                                                        )
                                                    }
                                                    className={selectClass}
                                                >
                                                    <option value="AM">
                                                        AM
                                                    </option>

                                                    <option value="PM">
                                                        PM
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                                Selected start
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {formatSelectedDateTime(
                                                    startDate,
                                                    startHour,
                                                    startMinute,
                                                    startPeriod
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* End */}
                                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                                        <div className="mb-5">
                                            <p className="text-sm font-bold text-gray-950">
                                                End date & time
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                                Choose when your event ends.
                                            </p>
                                        </div>

                                        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-3">
                                            <DayPicker
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                disabled={{
                                                    before:
                                                        startDate || today,
                                                }}
                                                defaultMonth={
                                                    endDate ||
                                                    startDate ||
                                                    today
                                                }
                                            />
                                        </div>

                                        <div className="mt-5 grid grid-cols-3 gap-3">
                                            <div>
                                                <label
                                                    htmlFor="end-hour"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                                                >
                                                    Hour
                                                </label>

                                                <select
                                                    id="end-hour"
                                                    value={endHour}
                                                    onChange={(event) =>
                                                        setEndHour(
                                                            event.target.value
                                                        )
                                                    }
                                                    className={selectClass}
                                                >
                                                    {Array.from(
                                                        { length: 12 },
                                                        (_, index) => {
                                                            const hour =
                                                                String(
                                                                    index + 1
                                                                ).padStart(
                                                                    2,
                                                                    "0"
                                                                );

                                                            return (
                                                                <option
                                                                    key={hour}
                                                                    value={hour}
                                                                >
                                                                    {hour}
                                                                </option>
                                                            );
                                                        }
                                                    )}
                                                </select>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="end-minute"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                                                >
                                                    Minute
                                                </label>

                                                <select
                                                    id="end-minute"
                                                    value={endMinute}
                                                    onChange={(event) =>
                                                        setEndMinute(
                                                            event.target.value
                                                        )
                                                    }
                                                    className={selectClass}
                                                >
                                                    {[
                                                        "00",
                                                        "15",
                                                        "30",
                                                        "45",
                                                    ].map((minute) => (
                                                        <option
                                                            key={minute}
                                                            value={minute}
                                                        >
                                                            {minute}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="end-period"
                                                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                                                >
                                                    Period
                                                </label>

                                                <select
                                                    id="end-period"
                                                    value={endPeriod}
                                                    onChange={(event) =>
                                                        setEndPeriod(
                                                            event.target.value
                                                        )
                                                    }
                                                    className={selectClass}
                                                >
                                                    <option value="AM">
                                                        AM
                                                    </option>

                                                    <option value="PM">
                                                        PM
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                                                Selected end
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-gray-900">
                                                {formatSelectedDateTime(
                                                    endDate,
                                                    endHour,
                                                    endMinute,
                                                    endPeriod
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Capacity */}
                            <section className="p-6 sm:p-8">
                                <div className="mb-7">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-950 text-sm font-bold text-white">
                                            3
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-bold text-gray-950">
                                                Attendance
                                            </h2>

                                            <p className="text-sm text-gray-500">
                                                Set the maximum number of
                                                attendees.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-sm">
                                    <label
                                        htmlFor="event-capacity"
                                        className="mb-2 block text-sm font-semibold text-gray-800"
                                    >
                                        Capacity
                                    </label>

                                    <input
                                        id="event-capacity"
                                        type="number"
                                        value={capacity}
                                        onChange={(event) =>
                                            setCapacity(
                                                event.target.value
                                            )
                                        }
                                        placeholder="e.g. 100"
                                        min="1"
                                        required
                                        className={inputClass}
                                    />

                                    <p className="mt-2 text-xs leading-5 text-gray-400">
                                        This determines the maximum number
                                        of people who can register.
                                    </p>
                                </div>
                            </section>

                            {/* Messages + submit */}
                            <section className="bg-gray-50 p-6 sm:p-8">
                                {error && (
                                    <div
                                        role="alert"
                                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700"
                                    >
                                        <div className="font-semibold">
                                            Could not create event
                                        </div>

                                        <div className="mt-1">
                                            {error}
                                        </div>
                                    </div>
                                )}

                                {success && (
                                    <div
                                        role="status"
                                        className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm leading-6 text-emerald-700"
                                    >
                                        <div className="font-semibold">
                                            Event created successfully
                                        </div>

                                        <div className="mt-1">
                                            {success}
                                        </div>

                                        <Link
                                            href="/events/my-events"
                                            className="mt-2 inline-block font-semibold underline underline-offset-4 hover:no-underline"
                                        >
                                            View My Events
                                        </Link>
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <Link
                                        href="/events"
                                        className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                                    >
                                        Cancel
                                    </Link>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {loading
                                            ? "Creating Event..."
                                            : "Create Event"}
                                    </button>
                                </div>
                            </section>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                        Your event will be created as a draft. You can
                        review and publish it from My Events.
                    </p>
                </div>
            </main>
        </>
    );
}