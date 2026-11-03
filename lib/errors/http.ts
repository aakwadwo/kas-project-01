import { NextResponse } from "next/server";
import { DomainError } from "./index";

/** Converts anything thrown by a service into a JSON HTTP response. */
export function errorResponse(
    error: unknown,
    fallbackMessage = "Something went wrong."
) {
    if (error instanceof DomainError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.status }
        );
    }

    console.error(fallbackMessage, error);

    return NextResponse.json(
        { error: fallbackMessage },
        { status: 500 }
    );
}

export function notLoggedIn() {
    return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
    );
}
