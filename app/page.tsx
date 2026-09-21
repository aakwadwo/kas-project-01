import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 text-gray-950">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gray-950 text-white">
                <div className="absolute inset-0">
                    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
                </div>

                <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 sm:px-8">
                    {/* Header */}
                    <header className="flex items-center justify-between py-6">
                        <Link
                            href="/"
                            className="group flex items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-gray-950 transition-transform duration-200 group-hover:scale-105">
                                CE
                            </div>

                            <div>
                                <div className="text-base font-bold tracking-tight">
                                    Campus Event
                                </div>

                                <div className="text-xs font-medium text-gray-400">
                                    Platform
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                            >
                                Sign in
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
                            >
                                Get Started
                            </Link>
                        </div>
                    </header>

                    {/* Hero content */}
                    <div className="flex flex-1 items-center py-16 lg:py-20">
                        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="max-w-3xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                    Built for campus communities
                                </div>

                                <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                                    Discover what&apos;s happening on campus.
                                </h1>

                                <p className="mt-7 max-w-2xl text-lg leading-8 text-gray-400 sm:text-xl">
                                    Find events, create experiences, and
                                    connect with your campus community — all
                                    from one simple platform.
                                </p>

                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-950 shadow-sm transition hover:bg-gray-100"
                                    >
                                        Create an account
                                        <span className="ml-2 text-lg">
                                            →
                                        </span>
                                    </Link>

                                    <Link
                                        href="/login"
                                        className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                                    >
                                        Sign in
                                    </Link>
                                </div>

                                <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300">
                                            ✓
                                        </span>
                                        Discover events
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300">
                                            ✓
                                        </span>
                                        Create your own
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300">
                                            ✓
                                        </span>
                                        Manage registrations
                                    </div>
                                </div>
                            </div>

                            {/* Hero visual */}
                            <div className="hidden lg:block">
                                <div className="relative mx-auto max-w-md">
                                    <div className="absolute -inset-6 rounded-[2rem] bg-white/5 blur-2xl" />

                                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
                                        <div className="mb-5 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                                                    Upcoming
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-white">
                                                    Campus events
                                                </p>
                                            </div>

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-950">
                                                CE
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-white">
                                                            Tech & Innovation
                                                            Meetup
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Engineering Block
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                                                        Published
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>📅 Friday</span>
                                                    <span>🕐 4:00 PM</span>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-white">
                                                            Student Leadership
                                                            Forum
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Main Auditorium
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-gray-300">
                                                        42 spots
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>📅 Saturday</span>
                                                    <span>🕐 10:00 AM</span>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-white">
                                                            Coding Workshop
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Computer Lab
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-gray-300">
                                                        18 spots
                                                    </span>
                                                </div>

                                                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                                    <span>📅 Monday</span>
                                                    <span>🕐 2:00 PM</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom indicator */}
                    <div className="flex items-center justify-between border-t border-white/10 py-5 text-xs text-gray-500">
                        <span>Campus Event Platform</span>

                        <span>
                            Discover · Create · Connect
                        </span>
                    </div>
                </div>
            </section>

            {/* Feature section */}
            <section className="bg-white px-5 py-20 sm:px-8 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                            Everything in one place
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                            Make campus events easier to manage.
                        </h2>

                        <p className="mt-4 text-base leading-7 text-gray-600">
                            Whether you are looking for something to attend
                            or organizing an event yourself, the platform
                            keeps everything simple.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 md:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-lg text-white">
                                🔎
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-gray-950">
                                Discover
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Browse published campus events and find
                                activities that match your interests.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-lg text-white">
                                ✨
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-gray-950">
                                Create
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Turn your idea into an event and share it
                                with students across your campus.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-lg text-white">
                                👥
                            </div>

                            <h3 className="mt-5 text-lg font-bold text-gray-950">
                                Connect
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Manage registrations and bring attendees
                                together around shared experiences.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gray-50 px-5 py-16 sm:px-8 lg:py-20">
                <div className="mx-auto max-w-5xl rounded-3xl bg-gray-950 px-6 py-12 text-center text-white shadow-xl sm:px-10 lg:px-16">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                        Get started
                    </p>

                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready to get involved?
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                        Create your account and start discovering what is
                        happening on campus.
                    </p>

                    <Link
                        href="/register"
                        className="mt-7 inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
                    >
                        Create an account
                        <span className="ml-2 text-lg">→</span>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white px-5 py-7 sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} Campus Event
                        Platform
                    </p>

                    <div className="flex items-center gap-5">
                        <Link
                            href="/login"
                            className="transition hover:text-gray-950"
                        >
                            Sign in
                        </Link>

                        <Link
                            href="/register"
                            className="transition hover:text-gray-950"
                        >
                            Create account
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}