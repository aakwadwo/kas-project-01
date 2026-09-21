"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function EditEventForm() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("");

  const [eventStatus, setEventStatus] =
      useState<EventStatus | null>(null);

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

      const response = await fetch(
          `/api/events/${eventId}`,
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
            "Could not load this event."
        );
        return;
      }

      const event: Event = data.event;

      if (event.status === "CANCELLED") {
        setEventStatus("CANCELLED");
        setError(
            "This event has been cancelled and cannot be edited."
        );
        return;
      }

      if (event.status === "COMPLETED") {
        setEventStatus("COMPLETED");
        setError(
            "This event has been completed and cannot be edited."
        );
        return;
      }

      setEventStatus(event.status);

      setTitle(event.title);
      setDescription(event.description);
      setLocation(event.location);

      setStartTime(
          formatDateTimeForInput(event.startTime)
      );

      setEndTime(
          formatDateTimeForInput(event.endTime)
      );

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
      window.removeEventListener(
          "pageshow",
          handlePageShow
      );
    };
  }, [eventId]);

  async function handleUpdateEvent(
      event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!eventId) {
      setError("Event ID is missing.");
      return;
    }

    if (
        eventStatus === "CANCELLED" ||
        eventStatus === "COMPLETED"
    ) {
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
        setError(
            data.error ||
            "Could not update event."
        );
        return;
      }

      setSuccess(
          "Your event has been updated successfully."
      );
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
        <>
          <Navbar />

          <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8 md:py-14">
            <div className="mx-auto max-w-4xl">
              <div className="animate-pulse">
                <div className="h-4 w-28 rounded bg-gray-200" />

                <div className="mt-6 h-11 w-64 rounded-lg bg-gray-200" />

                <div className="mt-4 h-5 w-96 max-w-full rounded bg-gray-200" />

                <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="space-y-7">
                    <div>
                      <div className="h-4 w-28 rounded bg-gray-200" />
                      <div className="mt-3 h-12 rounded-xl bg-gray-200" />
                    </div>

                    <div>
                      <div className="h-4 w-28 rounded bg-gray-200" />
                      <div className="mt-3 h-32 rounded-xl bg-gray-200" />
                    </div>

                    <div>
                      <div className="h-4 w-24 rounded bg-gray-200" />
                      <div className="mt-3 h-12 rounded-xl bg-gray-200" />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <div className="h-4 w-24 rounded bg-gray-200" />
                        <div className="mt-3 h-12 rounded-xl bg-gray-200" />
                      </div>

                      <div>
                        <div className="h-4 w-20 rounded bg-gray-200" />
                        <div className="mt-3 h-12 rounded-xl bg-gray-200" />
                      </div>
                    </div>

                    <div>
                      <div className="h-4 w-20 rounded bg-gray-200" />
                      <div className="mt-3 h-12 rounded-xl bg-gray-200" />
                    </div>

                    <div className="h-12 rounded-xl bg-gray-200" />
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

          <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8 md:py-14">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 font-bold text-red-600">
                    !
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">
                      Unable to edit event
                    </p>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
                      This event cannot be edited
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {error ||
                          "You do not have permission to edit this event."}
                    </p>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                      href="/events/my-events"
                      className="rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Back to My Events
                  </Link>

                  <Link
                      href="/events"
                      className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    All Events
                  </Link>
                </div>
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
          <div className="mx-auto max-w-4xl">

            {/* Header */}
            <div className="mb-8">
              <Link
                  href="/events/my-events"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950"
              >
                <span>←</span>
                Back to My Events
              </Link>

              <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  Event Management
                </p>

                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                      Edit Event
                    </h1>

                    <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                      Update your event details
                      and keep your campus
                      community informed.
                    </p>
                  </div>

                  {eventStatus && (
                      <span
                          className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              eventStatus ===
                              "PUBLISHED"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                      >
                                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />

                        {eventStatus ===
                        "PUBLISHED"
                            ? "Published"
                            : "Draft"}
                                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form */}
            <form
                onSubmit={handleUpdateEvent}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="p-6 sm:p-8">

                {/* Basic information */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                    Basic information
                  </p>

                  <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-950">
                    Tell people about your event
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Make sure your event information
                    is clear and easy to understand.
                  </p>
                </div>

                <div className="mt-7 space-y-6">
                  {/* Title */}
                  <div>
                    <label
                        htmlFor="title"
                        className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Event title
                    </label>

                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(
                                event.target.value
                            )
                        }
                        placeholder="e.g. Tech Talk: The Future of AI"
                        required
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Description
                    </label>

                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value
                            )
                        }
                        placeholder="Describe what attendees can expect..."
                        required
                        rows={6}
                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      Give attendees enough
                      information to understand
                      the purpose of the event.
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <label
                        htmlFor="location"
                        className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Location
                    </label>

                    <div className="relative">
                                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm">
                                            📍
                                        </span>

                      <input
                          id="location"
                          type="text"
                          value={location}
                          onChange={(event) =>
                              setLocation(
                                  event.target.value
                              )
                          }
                          placeholder="e.g. Engineering Block, Room 204"
                          required
                          className="w-full rounded-xl border border-gray-300 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="mt-10 border-t border-gray-100 pt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                    Schedule
                  </p>

                  <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-950">
                    When is it happening?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Choose when your event starts
                    and ends.
                  </p>

                  <div className="mt-7 grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                          htmlFor="startTime"
                          className="mb-2 block text-sm font-semibold text-gray-800"
                      >
                        Start date & time
                      </label>

                      <input
                          id="startTime"
                          type="datetime-local"
                          value={startTime}
                          onChange={(event) =>
                              setStartTime(
                                  event.target
                                      .value
                              )
                          }
                          required
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                      />
                    </div>

                    <div>
                      <label
                          htmlFor="endTime"
                          className="mb-2 block text-sm font-semibold text-gray-800"
                      >
                        End date & time
                      </label>

                      <input
                          id="endTime"
                          type="datetime-local"
                          value={endTime}
                          onChange={(event) =>
                              setEndTime(
                                  event.target
                                      .value
                              )
                          }
                          required
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="mt-10 border-t border-gray-100 pt-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                    Attendance
                  </p>

                  <h2 className="mt-2 text-xl font-bold tracking-tight text-gray-950">
                    Set your capacity
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Choose the maximum number of
                    attendees your event can
                    accommodate.
                  </p>

                  <div className="mt-7 max-w-sm">
                    <label
                        htmlFor="capacity"
                        className="mb-2 block text-sm font-semibold text-gray-800"
                    >
                      Maximum attendees
                    </label>

                    <input
                        id="capacity"
                        type="number"
                        value={capacity}
                        onChange={(event) =>
                            setCapacity(
                                event.target.value
                            )
                        }
                        min="1"
                        required
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                    />
                  </div>
                </div>

                {/* Messages */}
                {error && (
                    <div
                        role="alert"
                        className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-600">
                          !
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-red-800">
                            Update failed
                          </p>

                          <p className="mt-1 text-sm leading-6 text-red-700">
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          ✓
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Event updated
                          </p>

                          <p className="mt-1 text-sm leading-6 text-emerald-700">
                            {success}
                          </p>
                        </div>
                      </div>
                    </div>
                )}
              </div>

              {/* Form footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <Link
                    href="/events/my-events"
                    className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </Link>

                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-950/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                      ? "Saving changes..."
                      : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Helpful note */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm">
                  💡
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Keep your attendees informed
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    If you change the time, location,
                    or other important details,
                    make sure your attendees are
                    aware of the update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
  );
}

export default function EditEventPage() {
  return (
      <Suspense
          fallback={
            <>
              <Navbar />

              <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8 md:py-14">
                <div className="mx-auto max-w-4xl">
                  <div className="animate-pulse">
                    <div className="h-4 w-28 rounded bg-gray-200" />

                    <div className="mt-7 h-11 w-64 rounded-lg bg-gray-200" />

                    <div className="mt-4 h-5 w-96 max-w-full rounded bg-gray-200" />

                    <div className="mt-10 h-[650px] rounded-2xl bg-white shadow-sm" />
                  </div>
                </div>
              </main>
            </>
          }
      >
        <EditEventForm />
      </Suspense>
  );
}