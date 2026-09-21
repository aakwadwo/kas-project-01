
"use client";

import { useState } from "react";
import Link from "next/link";

type Role = "STUDENT" | "ORGANIZER";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [role, setRole] = useState<Role>("STUDENT");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleRegister(
        event: React.FormEvent
    ) {
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
                setError(
                    data.error || "Could not create account."
                );
                return;
            }

            setSuccess(
                `Account created successfully as ${
    role === "STUDENT"
        ? "Student"
        : "Organizer"
}!`
            );

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
                            Your campus starts here
                        </p>

                        <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
                            Be part of what&apos;s happening.
                        </h1>

                        <p className="mt-6 max-w-md text-lg leading-8 text-gray-400">
                            Join your campus community, discover events,
                            and create experiences that bring students
                            together.
                        </p>
                    </div>

                    <p className="text-sm text-gray-500">
                        Campus Event Platform
                    </p>
                </section>

                {/* Registration section */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
                    <div className="w-full max-w-md">

                        {/* Mobile brand */}
                        <div className="mb-8 flex items-center gap-3 lg:hidden">
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

                        <div className="mb-7">
                            <p className="mb-2 text-sm font-semibold text-gray-500">
                                Get started
                            </p>

                            <h2 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                                Create your account
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                Join your campus community and start
                                discovering what&apos;s happening.
                            </p>
                        </div>

                        <form
                            onSubmit={handleRegister}
                            className="space-y-5"
                        >
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-semibold text-gray-800"
                                >
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                                />
                            </div>

                            {/* Email */}
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

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-gray-800"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Create a password"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-16 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <p className="mt-2 text-xs text-gray-500">
                                    Use at least 6 characters.
                                </p>
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-semibold text-gray-800"
                                >
                                    Confirm password
                                </label>

                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={(event) =>
                                            setConfirmPassword(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Confirm your password"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 pr-16 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-4 focus:ring-gray-950/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                                    >
                                        {showConfirmPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>
                                </div>
                            </div>

                            {/* Account type */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold text-gray-800">
                                    Account type
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRole("STUDENT")
                                        }
                                        className={`rounded-xl border p-4 text-left transition ${
    role === "STUDENT"
        ? "border-gray-950 bg-gray-950 text-white shadow-sm"
        : "border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50"
}`}
                                    >
                                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">
                                            🎓
                                        </div>

                                        <div className="font-semibold">
                                            Student
                                        </div>

                                        <div
                                            className={`mt-1 text-xs leading-5 ${
    role === "STUDENT"
        ? "text-gray-400"
        : "text-gray-500"
}`}
                                        >
                                            Attend campus events
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setRole("ORGANIZER")
                                        }
                                        className={`rounded-xl border p-4 text-left transition ${
    role === "ORGANIZER"
        ? "border-gray-950 bg-gray-950 text-white shadow-sm"
        : "border-gray-300 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50"
}`}
                                    >
                                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">
                                            💼
                                        </div>

                                        <div className="font-semibold">
                                            Organizer
                                        </div>

                                        <div
                                            className={`mt-1 text-xs leading-5 ${
    role === "ORGANIZER"
        ? "text-gray-400"
        : "text-gray-500"
}`}
                                        >
                                            Create and manage events
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Selected role */}
                            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Selected account
                                </p>

                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                    {role === "STUDENT"
                                        ? "🎓 Student"
                                        : "💼 Organizer"}
                                </p>
                            </div>

                            {/* Messages */}
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div
                                    role="status"
                                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
                                >
                                    {success}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gray-950 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-950/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <div className="my-7 flex items-center gap-4">
                            <div className="h-px flex-1 bg-gray-200" />

                            <span className="text-xs font-medium text-gray-400">
                                ALREADY A MEMBER?
                            </span>

                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        <Link
                            href="/login"
                            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-center text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
                        >
                            Sign in instead
                        </Link>

                        <p className="mt-7 text-center text-xs leading-5 text-gray-500">
                            By creating an account, you agree to use the
                            platform responsibly and respect your campus
                            community.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}

