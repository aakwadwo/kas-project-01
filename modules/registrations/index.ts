/**
 * REGISTRATIONS module - PUBLIC INTERFACE.
 *
 * Everything other modules and API routes may use is exported here.
 * Nothing outside this folder may import the repository, rules or
 * service files directly, and nobody else touches the Registration table.
 */
export {
    registerForEvent,
    cancelRegistration,
    getMyRegistration,
    listMyRegistrations,
    listActiveRegistrationsForEvent,
    countActiveRegistrations,
    isStudentRegistered,
} from "./registrations.service";

export type {
    Registration,
    RegistrationStatus,
} from "./registrations.types";
