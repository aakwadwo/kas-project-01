export type RegistrationStatus = "REGISTERED" | "CANCELLED";

export type Registration = {
    id: string;
    studentId: string;
    eventId: string;
    status: RegistrationStatus;
    registeredAt: string;
    cancelledAt: string | null;
};
