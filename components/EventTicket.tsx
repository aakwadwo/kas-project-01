"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { DateStub, StatusStamp } from "@/components/ui";
import { ClockIcon, PinIcon, UsersIcon } from "@/components/icons";
import {
    formatTimeRange,
    plural,
    relativeDay,
    type EventStatus,
} from "@/lib/ui/format";

export type TicketEvent = {
    id: string;
    title: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    capacity: number;
    status: EventStatus;
};

/**
 * An event rendered as a tear-off ticket: date stub on the left,
 * details on the right, perforated action strip at the bottom.
 */
export default function EventTicket({
    event,
    badges,
    actions,
    now,
}: {
    event: TicketEvent;
    badges?: ReactNode;
    actions: ReactNode;
    now: number;
}) {
    const inactive =
        event.status === "CANCELLED" || event.status === "COMPLETED";
    const soon = relativeDay(event.startTime, now);

    return (
        <article
            className={`ticket ticket-hover flex flex-col ${inactive ? "opacity-80" : ""}`}
            aria-labelledby={`ev-${event.id}`}
        >
            <div className="flex flex-1">
                <div className="flex w-[5.5rem] shrink-0 flex-col items-center justify-center gap-2 border-r-2 border-dashed border-ink bg-paper/60 py-5 sm:w-24">
                    <DateStub value={event.startTime} muted={inactive} />
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusStamp status={event.status} />
                        {badges}
                        {!inactive && (
                            <span className="ml-auto font-mono text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-mute">
                                {soon}
                            </span>
                        )}
                    </div>

                    <h2
                        id={`ev-${event.id}`}
                        className={`mt-3 font-display text-[1.4rem] font-extrabold leading-[1.1] tracking-tight ${
                            event.status === "CANCELLED" ? "line-through decoration-signal decoration-[3px]" : ""
                        }`}
                    >
                        <Link
                            href={`/events/${event.id}`}
                            className="line-clamp-2 hover:underline hover:decoration-signal hover:decoration-[3px] hover:underline-offset-4"
                        >
                            {event.title}
                        </Link>
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-soft">
                        {event.description}
                    </p>

                    <ul className="mt-auto grid gap-1.5 pt-4 text-sm text-ink">
                        <li className="flex items-center gap-2">
                            <ClockIcon size={15} className="shrink-0 text-ink-mute" />
                            {formatTimeRange(event.startTime, event.endTime)}
                        </li>
                        <li className="flex min-w-0 items-center gap-2">
                            <PinIcon size={15} className="shrink-0 text-ink-mute" />
                            <span className="truncate">{event.location}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <UsersIcon size={15} className="shrink-0 text-ink-mute" />
                            {plural(event.capacity, "spot")}
                        </li>
                    </ul>
                </div>
            </div>

            <div className="perf-x flex flex-wrap items-center gap-2 px-4 py-3">
                {actions}
            </div>
        </article>
    );
}
