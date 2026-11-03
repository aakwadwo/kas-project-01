/**
 * Data access for the "Registration" table.
 *
 * RULE: this is the ONLY file in the whole app that reads or writes the
 * Registration table. No business rules here - just queries.
 */
import { supabase } from "@/lib/supabase/client";
import type { Registration } from "./registrations.types";

const TABLE = "Registration";

export async function findByStudentAndEvent(
    studentId: string,
    eventId: string
): Promise<Registration | null> {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("studentId", studentId)
        .eq("eventId", eventId)
        .maybeSingle();

    if (error) throw error;

    return (data as Registration | null) ?? null;
}

export async function countActiveByEvent(
    eventId: string
): Promise<number> {
    const { count, error } = await supabase
        .from(TABLE)
        .select("id", { count: "exact", head: true })
        .eq("eventId", eventId)
        .eq("status", "REGISTERED");

    if (error) throw error;

    return count ?? 0;
}

export async function listActiveByEvent(
    eventId: string
): Promise<Registration[]> {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("eventId", eventId)
        .eq("status", "REGISTERED")
        .order("registeredAt", { ascending: true });

    if (error) throw error;

    return (data ?? []) as Registration[];
}

export async function listByStudent(
    studentId: string
): Promise<Registration[]> {
    const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("studentId", studentId)
        .order("registeredAt", { ascending: false });

    if (error) throw error;

    return (data ?? []) as Registration[];
}

export async function insert(
    studentId: string,
    eventId: string
): Promise<Registration> {
    const { data, error } = await supabase
        .from(TABLE)
        .insert({
            id: crypto.randomUUID(),
            studentId,
            eventId,
            status: "REGISTERED",
            registeredAt: new Date().toISOString(),
        })
        .select("*")
        .single();

    if (error) throw error;

    return data as Registration;
}

/** A student who cancelled and registers again re-uses the same row. */
export async function reactivate(id: string): Promise<Registration> {
    const { data, error } = await supabase
        .from(TABLE)
        .update({
            status: "REGISTERED",
            registeredAt: new Date().toISOString(),
            cancelledAt: null,
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw error;

    return data as Registration;
}

export async function markCancelled(id: string): Promise<Registration> {
    const { data, error } = await supabase
        .from(TABLE)
        .update({
            status: "CANCELLED",
            cancelledAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) throw error;

    return data as Registration;
}
