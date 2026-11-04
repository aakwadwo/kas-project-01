"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    SpinnerIcon,
    XIcon,
} from "@/components/icons";

type VerificationState =
    | "verifying"
    | "success"
    | "already-verified"
    | "error";

const POSTER = {
    kicker: "One last thing",
    headline: (
        <>
            Check the <span className="text-sun">stamp.</span>
        </>
    ),
    body: "Confirming your email keeps your account yours, and makes sure event updates actually reach you.",
};

const HEADINGS: Record<VerificationState, string> = {
    verifying: "Checking your link…",
    success: "Email confirmed.",
    "already-verified": "Already confirmed.",
    error: "That link didn't work.",
};

function StatusBadge({ state }: { state: VerificationState }) {
    const isSuccess = state === "success" || state === "already-verified";
    const tone =
        state === "verifying"
            ? "bg-sun text-ink"
            : isSuccess
              ? "bg-moss text-white"
              : "bg-signal text-white";

    return (
        <div
            className={`mx-auto flex h-20 w-20 -rotate-6 items-center justify-center rounded-2xl border-2 border-ink shadow-[var(--shadow-hard)] ${tone}`}
        >
            {state === "verifying" && <SpinnerIcon size={34} strokeWidth={2.5} />}
            {isSuccess && <CheckIcon size={36} strokeWidth={2.75} />}
            {state === "error" && <XIcon size={34} strokeWidth={2.75} />}
        </div>
    );
}

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [state, setState] = useState<VerificationState>("verifying");

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
                    `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
                    {
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setState("error");
                    setMessage(
                        data.error || "We could not verify your email address."
                    );
                    return;
                }

                if (data.message === "Your email is already verified.") {
                    setState("already-verified");
                    setMessage(data.message);
                    return;
                }

                setState("success");
                setMessage(
                    data.message || "Your email has been verified successfully."
                );
            } catch (error) {
                console.error("Email verification request failed:", error);

                setState("error");
                setMessage("Something went wrong while verifying your email.");
            }
        }

        verifyEmail();
    }, [token]);

    const isSuccess = state === "success" || state === "already-verified";

    return (
        <AuthShell poster={POSTER}>
            <div className="panel p-7 text-center sm:p-9">
                <StatusBadge state={state} />

                <h1 className="display mt-8 text-4xl" aria-live="polite">
                    {HEADINGS[state]}
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-ink-soft">
                    {message}
                </p>

                <div className="mt-8">
                    {isSuccess && (
                        <Link href="/login" className="btn btn-primary btn-lg w-full">
                            Continue to sign in
                            <ArrowRightIcon size={18} strokeWidth={2.5} />
                        </Link>
                    )}

                    {state === "error" && (
                        <Link href="/register" className="btn btn-primary btn-lg w-full">
                            Back to sign up
                        </Link>
                    )}

                    {state === "verifying" && (
                        <p className="rounded-xl bg-paper-deep px-5 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                            Hang tight, this takes a second
                        </p>
                    )}
                </div>

                <div className="mt-7 border-t-2 border-dashed border-line pt-5">
                    <Link
                        href="/"
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-soft transition hover:text-ink"
                    >
                        <ArrowLeftIcon size={16} />
                        Back to home
                    </Link>
                </div>
            </div>
        </AuthShell>
    );
}

function VerifyEmailLoading() {
    return (
        <AuthShell poster={POSTER}>
            <div className="panel p-7 text-center sm:p-9">
                <StatusBadge state="verifying" />
                <h1 className="display mt-8 text-4xl">Loading…</h1>
                <p className="mt-3 text-base leading-7 text-ink-soft">
                    Getting your verification request ready.
                </p>
            </div>
        </AuthShell>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<VerifyEmailLoading />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
