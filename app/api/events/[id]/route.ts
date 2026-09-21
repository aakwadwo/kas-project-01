import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/jwt/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

function isEventStillVisible(startTime: string) {
  const start = new Date(startTime).getTime();

  if (Number.isNaN(start)) {
    return false;
  }

  return Date.now() < start + ONE_HOUR_IN_MS;
}

export async function GET(
    request: Request,
    context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
          { error: "You must be logged in." },
          { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
          { error: "Event ID is required." },
          { status: 400 }
      );
    }

    const { data: event, error } = await supabase
        .from("Event")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !event) {
      return NextResponse.json(
          { error: "Event not found." },
          { status: 404 }
      );
    }

    /*
     * Once one hour has passed since the event started,
     * the event is no longer available through the platform.
     *
     * The database record is NOT deleted.
     */
    if (!isEventStillVisible(event.startTime)) {
      return NextResponse.json(
          {
            error:
                "This event is no longer available because it ended more than one hour ago.",
          },
          { status: 410 }
      );
    }

    const isOwner =
        event.organizerId === user.userId;

    /*
     * Owners can view their own events,
     * including DRAFT, PUBLISHED, CANCELLED
     * and COMPLETED events while they are still
     * within the one-hour visibility window.
     */
    if (isOwner) {
      return NextResponse.json({ event });
    }

    /*
     * Other users can only view published events.
     */
    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
          { error: "This event is not available." },
          { status: 403 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Get event error:", error);

    return NextResponse.json(
        {
          error:
              "Something went wrong while loading the event.",
        },
        { status: 500 }
    );
  }
}