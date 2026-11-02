/**
 * A business-rule failure that is safe to show to the user.
 * Services throw these; the API layer turns them into HTTP responses.
 */
export class DomainError extends Error {
    constructor(
        message: string,
        public readonly status: number = 400
    ) {
        super(message);
        this.name = "DomainError";
    }
}

/** Postgres "unique_violation" - e.g. a duplicate (studentId, eventId) row. */
export function isUniqueViolation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        (error as { code?: string }).code === "23505"
    );
}
