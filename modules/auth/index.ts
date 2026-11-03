/**
 * AUTH module - public interface (read-only part).
 *
 * NOTE: Roderick owns this module. Samuel added ONLY the lookup that the
 * organizer's attendee list needs (names/emails, never password hashes).
 */
import { supabase } from "@/lib/supabase/client";

export type PublicUser = {
    id: string;
    name: string;
    email: string;
};

export async function getUsersByIds(
    userIds: string[]
): Promise<PublicUser[]> {
    if (userIds.length === 0) return [];

    const { data, error } = await supabase
        .from("User")
        .select("id, name, email")
        .in("id", userIds);

    if (error) throw error;

    return (data ?? []) as PublicUser[];
}
