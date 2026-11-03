/** Shared date/number formatting for the UI layer. */

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export function formatLongDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export function formatShortDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatTime(value: string) {
    return new Date(value).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function formatTimeRange(start: string, end: string) {
    return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDateTime(value: string) {
    return new Date(value).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

/** Pieces for the tear-off date stub on tickets. */
export function dateStub(value: string) {
    const date = new Date(value);
    return {
        weekday: date
            .toLocaleDateString(undefined, { weekday: "short" })
            .toUpperCase(),
        day: date.getDate(),
        month: date
            .toLocaleDateString(undefined, { month: "short" })
            .toUpperCase(),
    };
}

/** "in 3 days", "tomorrow", "today", "2 days ago" */
export function relativeDay(value: string, now = Date.now()) {
    const startOfDay = (t: number) => {
        const d = new Date(t);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    };
    const diff = Math.round(
        (startOfDay(new Date(value).getTime()) - startOfDay(now)) / 86_400_000
    );
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    if (Math.abs(diff) < 7) return rtf.format(diff, "day");
    if (Math.abs(diff) < 35) return rtf.format(Math.round(diff / 7), "week");
    return rtf.format(Math.round(diff / 30), "month");
}

export function plural(count: number, one: string, many = `${one}s`) {
    return `${count} ${count === 1 ? one : many}`;
}

export function initials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
}
