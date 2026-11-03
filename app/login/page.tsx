"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell, { PasswordToggle } from "@/components/AuthShell";
import { Notice } from "@/components/ui";
import { ArrowRightIcon, SpinnerIcon } from "@/components/icons";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: React.FormEvent) {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed.");
                return;
            }

            window.location.href = "/events";
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthShell
            poster={{
                kicker: "Welcome back",
                headline: (
                    <>
                        See what&apos;s on <span className="text-sun">tonight.</span>
                    </>
                ),
                body: "Your tickets, your events and everything new on the board since you last looked.",
            }}
        >
            <p className="eyebrow">Sign in</p>
            <h2 className="display mt-3 text-5xl">Hey again.</h2>
            <p className="mt-3 text-base leading-7 text-ink-soft">
                Use the email you signed up with.
            </p>

            <form onSubmit={handleLogin} className="mt-9 space-y-5">
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
                        aria-invalid={error ? true : undefined}
                        className="field"
                    />
                </div>

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
                            placeholder="Your password"
                            autoComplete="current-password"
                            required
                            aria-invalid={error ? true : undefined}
                            className="field pr-14"
                        />
                        <PasswordToggle
                            shown={showPassword}
                            onToggle={() => setShowPassword((s) => !s)}
                            controls="password"
                        />
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
                            Signing in…
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRightIcon size={18} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-10 rounded-2xl border-2 border-dashed border-ink/40 p-5 text-center">
                <p className="text-sm text-ink-soft">New around here?</p>
                <Link
                    href="/register"
                    className="mt-1 inline-flex min-h-11 items-center gap-1.5 font-display text-lg font-extrabold underline decoration-signal decoration-[3px] underline-offset-4 hover:decoration-ink"
                >
                    Make an account
                    <ArrowRightIcon size={16} strokeWidth={2.5} />
                </Link>
            </div>
        </AuthShell>
    );
}
