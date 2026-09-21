"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type VerificationState =
    | "verifying"
    | "success"
    | "already-verified"
    | "error";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [state, setState] =
        useState<VerificationState>("verifying");

    const [message, setMessage] = useState(
        "We're verifying your email address..."
    );

    useEffect(() => {
        async function verifyEmail() {
            if (!token) {
                setState("error");
                setMessage(
                    "This verification link is missing a verification token."
                );
                return;
            }

            try {
                const response = await fetch(
                    `/api/auth/verify-email?token=${encodeURIComponent(
                        token
                    )}`,
                    {
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setState("error");
                    setMessage(
                        data.error ||
                        "We could not verify your email address."
                    );
                    return;
                }

                if (
                    data.message ===
                    "Your email is already verified."
                ) {
                    setState("already-verified");
                    setMessage(data.message);
                    return;
                }

                setState("success");
                setMessage(
                    data.message ||
                    "Your email has been verified successfully."
                );
            } catch (error) {
                console.error(
                    "Email verification request failed:",
                    error
                );

                setState("error");
                setMessage(
                    "Something went wrong while verifying your email."
                );
            }
        }

        verifyEmail();
    }, [token]);

    const isSuccess =
        state === "success" ||
        state === "already-verified";

    return (
        <main className="min-h-screen bg-gray-50 text-gray-950">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Brand panel */}
                <section className="relative hidden overflow-hidden bg-gray-950 lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute inset-0">
                        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
                        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
                    </div>

                    <div className="relative p-10 xl:p-14">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-gray-950 transition-transform duration-200 group-hover:scale-105">
                                CE
                            </div>

                            <div>
                                <div className="text-base font-bold tracking-tight text-white">
                                    Campus Event
                                </div>

                                <div className="text-xs font-medium text-gray-500">
                                    Platform
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="relative px-10 pb-14 xl:px-14">
                        <div className="max-w-xl">
                            <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                                Account security
                            </p>

                            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                                One quick step before you get started.
                            </h2>

                            <p className="mt-6 max-w-lg text-base leading-7 text-gray-400">
                                Verifying your email helps keep your
                                Campus Event Platform account secure and
                                ensures that your account is connected to
                                a valid email address.
                            </p>
                        </div>

                        <div className="mt-10 flex items-center gap-3 text-sm text-gray-500">
                            <div className="h-px w-10 bg-gray-800" />
                            <span>
                                Discover · Create · Connect
                            </span>
                        </div>
                    </div>
                </section>

                {/* Verification panel */}
                <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
                    <div className="w-full max-w-md">
                        {/* Mobile brand */}
                        <div className="mb-10 lg:hidden">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-3"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white">
                                    CE
                                </div>

                                <div>
                                    <div className="text-base font-bold tracking-tight text-gray-950">
                                        Campus Event
                                    </div>

                                    <div className="text-xs font-medium text-gray-500">
                                        Platform
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
                            {/* Status icon */}
                            <div
                                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
                                    state === "verifying"
                                        ? "bg-gray-100"
                                        : isSuccess
                                            ? "bg-emerald-50"
                                            : "bg-red-50"
                                }`}
                            >
                                {state === "verifying" && (
                                    <svg
                                        className="h-9 w-9 animate-spin text-gray-700"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-20"
                                            cx="12"
                                            cy="12"
                                            r="9"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />

                                        <path
                                            className="opacity-80"
                                            fill="currentColor"
                                            d="M12 3a9 9 0 019 9h-3a6 6 0 00-6-6V3z"
                                        />
                                    </svg>
                                )}

                                {isSuccess && (
                                    <svg
                                        className="h-9 w-9 text-emerald-600"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}

                                {state === "error" && (
                                    <svg
                                        className="h-9 w-9 text-red-600"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                )}
                            </div>

                            {/* Heading */}
                            <div className="mt-7 text-center">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                                    Campus Event Platform
                                </p>

                                <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                                    {state === "verifying" &&
                                        "Verifying your email"}

                                    {state === "success" &&
                                        "Email verified!"}

                                    {state === "already-verified" &&
                                        "Email already verified"}

                                    {state === "error" &&
                                        "Verification failed"}
                                </h1>

                                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
                                    {message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="mt-8">
                                {isSuccess && (
                                    <Link
                                        href="/login"
                                        className="flex w-full items-center justify-center rounded-xl bg-gray-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                    >
                                        Continue to login
                                        <span className="ml-2 text-lg">
                                            →
                                        </span>
                                    </Link>
                                )}

                                {state === "error" && (
                                    <Link
                                        href="/register"
                                        className="flex w-full items-center justify-center rounded-xl bg-gray-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                                    >
                                        Back to registration
                                    </Link>
                                )}

                                {state === "verifying" && (
                                    <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-5 py-3.5 text-sm font-medium text-gray-500">
                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                        Please wait while we check your
                                        verification link
                                    </div>
                                )}
                            </div>

                            {/* Footer link */}
                            <div className="mt-7 border-t border-gray-100 pt-6 text-center">
                                <Link
                                    href="/"
                                    className="text-sm font-medium text-gray-500 transition hover:text-gray-950"
                                >
                                    ← Return to home
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

function VerifyEmailLoading() {
    return (
        <main className="min-h-screen bg-gray-50 text-gray-950">
            <div className="flex min-h-screen items-center justify-center px-5">
                <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <svg
                            className="h-9 w-9 animate-spin text-gray-700"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-20"
                                cx="12"
                                cy="12"
                                r="9"
                                stroke="currentColor"
                                strokeWidth="3"
                            />

                            <path
                                className="opacity-80"
                                fill="currentColor"
                                d="M12 3a9 9 0 019 9h-3a6 6 0 00-6-6V3z"
                            />
                        </svg>
                    </div>

                    <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        Campus Event Platform
                    </p>

                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
                        Loading verification
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        Please wait while we prepare your verification
                        request...
                    </p>
                </div>
            </div>
        </main>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailLoading />}>
            <VerifyEmailContent />
        </Suspense>
    );
}