"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell, { PasswordToggle } from "@/components/AuthShell";
import { Notice } from "@/components/ui";
import {
    ArrowRightIcon,
    CheckIcon,
    GradCapIcon,
    MegaphoneIcon,
    SpinnerIcon,
} from "@/components/icons";

type Role = "STUDENT" | "ORGANIZER";

const ROLES: {
    value: Role;
    title: string;
    body: string;
    Icon: typeof GradCapIcon;
}[] = [
    {
        value: "STUDENT",
        title: "Student",
        body: "Find events and grab spots",
        Icon: GradCapIcon,
    },
    {
        value: "ORGANIZER",
        title: "Organiser",
        body: "Run events for a society or team",
        Icon: MegaphoneIcon,
    },
];

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [role, setRole] = useState<Role>("STUDENT");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const mismatch =
        confirmPassword.length > 0 && password !== confirmPassword;

    async function handleRegister(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Could not create account.");
                return;
            }

            setSuccess(email);

            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setRole("STUDENT");
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            poster={{
                kicker: "Join the board",
                headline: (
                    <>
                        Be where <span className="text-sun">it&apos;s</span>{" "}
                        happening.
                    </>
                ),
                body: "One account for every talk, social and workshop on campus, plus the ones you run yourself.",
            }}
        >
            {success ? (
                <div className="panel p-7 text-center sm:p-9" role="status">
                    <div className="mx-auto flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl border-2 border-ink bg-moss text-white">
                        <CheckIcon size={30} strokeWidth={2.75} />
                    </div>
                    <h2 className="display mt-6 text-4xl">You&apos;re in.</h2>
                    <p className="mt-3 text-base leading-7 text-ink-soft">
                        We sent a verification link to{" "}
                        <strong className="text-ink">{success}</strong>. Open
                        it to confirm your email, then sign in.
                    </p>
                    <Link href="/login" className="btn btn-primary btn-lg mt-8 w-full">
                        Go to sign in
                        <ArrowRightIcon size={18} strokeWidth={2.5} />
                    </Link>
                </div>
            ) : (
                <>
                    <p className="eyebrow">Create account</p>
                    <h2 className="display mt-3 text-5xl">Pull up a chair.</h2>
                    <p className="mt-3 text-base leading-7 text-ink-soft">
                        Takes about thirty seconds.
                    </p>

                    <form onSubmit={handleRegister} className="mt-9 space-y-5">
                        <fieldset>
                            <legend className="field-label">I&apos;m here as a…</legend>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map(({ value, title, body, Icon }) => {
                                    const checked = role === value;
                                    return (
                                        <label
                                            key={value}
                                            className={`relative cursor-pointer rounded-xl border-2 border-ink p-4 transition-all duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-[2.5px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal ${
                                                checked
                                                    ? "bg-ink text-card shadow-[3px_3px_0_0_var(--color-signal)]"
                                                    : "bg-card hover:bg-sun-wash"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                value={value}
                                                checked={checked}
                                                onChange={() => setRole(value)}
                                                className="sr-only"
                                            />
                                            <span className="flex items-center justify-between">
                                                <Icon size={22} />
                                                <span
                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                                        checked
                                                            ? "border-sun bg-sun text-ink"
                                                            : "border-ink"
                                                    }`}
                                                >
                                                    {checked && (
                                                        <CheckIcon size={12} strokeWidth={3.5} />
                                                    )}
                                                </span>
                                            </span>
                                            <span className="mt-4 block font-display text-lg font-extrabold">
                                                {title}
                                            </span>
                                            <span
                                                className={`mt-0.5 block text-xs leading-5 ${
                                                    checked ? "text-card/70" : "text-ink-mute"
                                                }`}
                                            >
                                                {body}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </fieldset>

                        <div>
                            <label htmlFor="name" className="field-label">
                                Full name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Ama Mensah"
                                autoComplete="name"
                                required
                                className="field"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="field-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@university.edu"
                                autoComplete="email"
                                inputMode="email"
                                required
                                className="field"
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="password" className="field-label">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                        aria-describedby="password-hint"
                                        className="field pr-14"
                                    />
                                    <PasswordToggle
                                        shown={showPassword}
                                        onToggle={() => setShowPassword((s) => !s)}
                                        controls="password"
                                    />
                                </div>
                                <p id="password-hint" className="field-hint">
                                    6+ characters.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="field-label">
                                    Confirm
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(event.target.value)
                                        }
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                        aria-invalid={mismatch || undefined}
                                        aria-describedby="confirm-hint"
                                        className="field pr-14"
                                    />
                                    <PasswordToggle
                                        shown={showConfirmPassword}
                                        onToggle={() => setShowConfirmPassword((s) => !s)}
                                        controls="confirmPassword"
                                    />
                                </div>
                                <p
                                    id="confirm-hint"
                                    className={`field-hint ${mismatch ? "!text-signal-deep font-semibold" : ""}`}
                                    aria-live="polite"
                                >
                                    {mismatch
                                        ? "Doesn't match yet."
                                        : confirmPassword && password === confirmPassword
                                          ? "Matches."
                                          : "Type it once more."}
                                </p>
                            </div>
                        </div>

                        {error && <Notice tone="error">{error}</Notice>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg w-full"
                        >
                            {loading ? (
                                <>
                                    <SpinnerIcon size={18} />
                                    Creating account…
                                </>
                            ) : (
                                <>
                                    Create my account
                                    <ArrowRightIcon size={18} strokeWidth={2.5} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-ink-soft">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-bold text-ink underline decoration-signal decoration-2 underline-offset-4 hover:decoration-ink"
                        >
                            Sign in
                        </Link>
                    </p>
                </>
            )}
        </AuthShell>
    );
}
