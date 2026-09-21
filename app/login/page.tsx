
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">

                {/* Brand section */}
                <section className="hidden flex-col justify-between bg-gray-950 p-12 text-white lg:flex xl:p-16">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-gray-950">
                                CE
                            </div>

                            <div>
                                <div className="text-base font-bold">
                                    Campus Event
                                </div>

                                <div className="text-xs text-gray-400">
                                    Platform
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="max-w-lg">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                            Campus events, simplified
                        </p>

                        <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
                            Discover what&apos;s happening on campus.
                        </h1>

                        <p className="mt-6 max-w-md text-lg leading-8 text-gray-400">
                            Find events, connect with your campus community,
                            and create experiences that bring people together.
                        </p>
                    </div>

                    <p className="text-sm text-gray-500">
                        Campus Event Platform
                    </p>
                </section>

                {/* Login section */}
                <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
                    <div className="w-full max-w-md">

                        {/* Mobile brand */}
                        <div className="mb-10 flex items-center gap-3 lg:hidden">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white">
                                CE
                            </div>

                            <div>
                                <div className="text-base font-bold text-gray-950">
                                    Campus Event
                                </div>

                                <div className="text-xs text-gray-500">
                                    Platform
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="mb-2 text-sm font-semibold text-gray-500">
                                Welcome back
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                                Sign in to your account
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                Access your events, registrations, and campus
                                activities.
                            </p>
                        </div>

                        <form
                            onSubmit={handleLogin}
                            className="space-y-5"
                        >
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-gray-800"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-gray-800"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                                />
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gray-950 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-950/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        <div className="my-8 flex items-center gap-4">
                            <div className="h-px flex-1 bg-gray-200" />

                            <span className="text-xs font-medium text-gray-400">
                                NEW TO THE PLATFORM?
                            </span>

                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        <Link
                            href="/register"
                            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-center text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                        >
                            Create an account
                        </Link>

                        <p className="mt-8 text-center text-xs leading-5 text-gray-500">
                            By continuing, you agree to use the platform
                            responsibly and respect your campus community.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

