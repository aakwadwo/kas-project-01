/**
 * EVENTS module - public interface (read-only part).
 *
 * Other modules must use these functions instead of querying the
 * "Event" table themselves.
 *
 * NOTE: Roderick owns this module. Samuel added ONLY the read functions
 * that REGISTRATIONS and ATTENDANCE need. Roderick: add your own exports
 * below, and feel free to change how these are implemented as long as the
 * signatures stay the same.
 */
import { supabase } from "@/lib/supabase/client";

export type EventStatus =
    | "DRAFT"
    | "PUBLISHED"
    | "CANCELLED"
    | "COMPLETED";

export type EventSummary = {
    id: string;
    title: string;
    location: string;
    status: EventStatus;
    startTime: string;
    endTime: string;
    capacity: number;
    organizerId: string;
};

const SUMMARY_COLUMNS =
    "id, title, location, status, startTime, endTime, capacity, organizerId";

export async function getEventSummary(
    eventId: string
): Promise<EventSummary | null> {
    const { data, error } = await supabase
        .from("Event")
        .select(SUMMARY_COLUMNS)
        .eq("id", eventId)
        .maybeSingle();

    if (error) throw error;

    return (data as EventSummary | null) ?? null;
}

export async function getEventSummaries(
    eventIds: string[]
): Promise<EventSummary[]> {
    if (eventIds.length === 0) return [];

    const { data, error } = await supabase
        .from("Event")
        .select(SUMMARY_COLUMNS)
        .in("id", eventIds);

    if (error) throw error;

    return (data ?? []) as EventSummary[];
}
