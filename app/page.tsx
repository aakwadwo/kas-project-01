import Link from "next/link";
import { Brand, DateStub } from "@/components/ui";
import {
    ArrowRightIcon,
    ClipboardIcon,
    MegaphoneIcon,
    PinIcon,
    TicketIcon,
    UsersIcon,
} from "@/components/icons";

/* Illustrative tickets pinned to the hero noticeboard. */
const SAMPLE_TICKETS = [
    {
        title: "Late-night hack & pizza",
        place: "Engineering Block, Lab 3",
        date: "2026-11-14T19:00:00",
        tag: "Workshop",
        rotate: "-rotate-3",
        offset: "lg:translate-x-4",
        pin: "bg-signal",
    },
    {
        title: "Open mic at the quad",
        place: "Main Quad steps",
        date: "2026-11-19T17:30:00",
        tag: "Social",
        rotate: "rotate-2",
        offset: "lg:-translate-x-6",
        pin: "bg-sky",
    },
    {
        title: "Careers in climate tech",
        place: "Auditorium B",
        date: "2026-11-24T13:00:00",
        tag: "Talk",
        rotate: "-rotate-1",
        offset: "lg:translate-x-10",
        pin: "bg-sun",
    },
];

const KINDS = [
    "Talks",
    "Workshops",
    "Society nights",
    "Hackathons",
    "Open mics",
    "Sports",
    "Study jams",
    "Career fairs",
];

export default function Home() {
    return (
        <main className="min-h-screen overflow-x-clip">
            {/* Header */}
            <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
                <Brand />
                <nav aria-label="Account" className="flex items-center gap-2">
                    <Link href="/login" className="btn btn-ghost btn-sm">
                        Sign in
                    </Link>
                    <Link href="/register" className="btn btn-primary btn-sm">
                        Join free
                    </Link>
                </nav>
            </header>

            {/* Hero */}
            <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-14">
                <div className="stagger">
                    <p className="eyebrow">
                        <span className="text-signal-deep">●</span> The campus
                        noticeboard
                    </p>

                    <h1 className="display mt-5 text-[3.4rem] sm:text-7xl lg:text-[6.2rem]">
                        Something&apos;s <span className="mark">always</span>{" "}
                        on.
                    </h1>

                    <p className="mt-7 max-w-xl text-lg leading-8 text-ink-soft">
                        Talks, socials, workshops, late-night hackathons. Find
                        what&apos;s happening around campus this week, save
                        your spot in one tap, or pin up an event of your own.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Link href="/register" className="btn btn-signal btn-lg">
                            Get on the list
                            <ArrowRightIcon size={18} strokeWidth={2.5} />
                        </Link>
                        <Link href="/login" className="btn btn-outline btn-lg">
                            I already have an account
                        </Link>
                    </div>
                </div>

                {/* Noticeboard */}
                <div
                    aria-hidden="true"
                    className="relative mx-auto w-full max-w-md lg:max-w-none"
                >
                    <div className="dot-grid absolute -inset-4 rounded-[2rem] border-2 border-ink bg-paper-deep sm:-inset-6" />
                    <div className="relative space-y-5 py-4">
                        {SAMPLE_TICKETS.map((t) => (
                            <div
                                key={t.title}
                                className={`ticket relative flex ${t.rotate} ${t.offset}`}
                            >
                                <span
                                    className={`absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-ink ${t.pin}`}
                                />
                                <DateStub
                                    value={t.date}
                                    className="w-24 shrink-0 border-r-2 border-dashed border-ink py-4"
                                />
                                <div className="min-w-0 flex-1 p-4">
                                    <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                                        {t.tag}
                                    </span>
                                    <p className="mt-1 font-display text-lg font-extrabold leading-tight tracking-tight">
                                        {t.title}
                                    </p>
                                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-soft">
                                        <PinIcon size={14} />
                                        {t.place}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Kinds strip */}
            <div className="border-y-2 border-ink bg-ink py-4 text-card">
                <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">
                    {KINDS.map((kind, i) => (
                        <li key={kind} className="flex items-center gap-6">
                            {kind}
                            {i < KINDS.length - 1 && (
                                <span className="text-sun" aria-hidden="true">
                                    ✶
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* How it works */}
            <section className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
                <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                    <div>
                        <p className="eyebrow">How it works</p>
                        <h2 className="display mt-3 text-5xl sm:text-6xl">
                            Three steps.
                            <br />
                            <span className="text-signal">No group chat</span>{" "}
                            required.
                        </h2>
                    </div>

                    <ol className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                        {[
                            {
                                n: "01",
                                title: "Find it",
                                body: "Everything published on campus lands on one board, sorted by date.",
                                Icon: PinIcon,
                            },
                            {
                                n: "02",
                                title: "Grab a spot",
                                body: "Register in a tap. Spots are capped, so you know there's room for you.",
                                Icon: TicketIcon,
                            },
                            {
                                n: "03",
                                title: "Show up",
                                body: "Your tickets live in one place, along with whether you checked in.",
                                Icon: UsersIcon,
                            },
                        ].map(({ n, title, body, Icon }) => (
                            <li key={n} className="panel p-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-display text-5xl font-extrabold tracking-tighter text-signal">
                                        {n}
                                    </span>
                                    <Icon size={26} className="text-ink" />
                                </div>
                                <h3 className="mt-6 font-display text-2xl font-extrabold tracking-tight">
                                    {title}
                                </h3>
                                <p className="mt-2 text-[0.95rem] leading-7 text-ink-soft">
                                    {body}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Organisers */}
            <section className="px-4 pb-24 sm:px-8">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border-2 border-ink bg-ink text-card shadow-[var(--shadow-hard-lg)]">
                    <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-signal" />
                    <div className="absolute -top-10 right-1/3 h-28 w-28 rounded-full border-2 border-card/20" />
                    <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
                        <div>
                            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-sun">
                                For societies & organisers
                            </p>
                            <h2 className="display mt-4 text-5xl sm:text-6xl">
                                Running something?
                            </h2>
                            <p className="mt-5 max-w-md text-lg leading-8 text-card/75">
                                Draft it, publish when you&apos;re ready, then
                                watch the guest list fill up. No spreadsheets.
                            </p>
                            <Link
                                href="/register"
                                className="btn btn-lg mt-9 border-card bg-sun text-ink shadow-[4px_4px_0_0_var(--color-signal)] hover:-translate-x-px hover:-translate-y-px"
                            >
                                Start hosting
                                <ArrowRightIcon size={18} strokeWidth={2.5} />
                            </Link>
                        </div>

                        <ul className="space-y-4 self-center">
                            {[
                                {
                                    Icon: ClipboardIcon,
                                    title: "Drafts stay private",
                                    body: "Polish details before anyone sees them.",
                                },
                                {
                                    Icon: MegaphoneIcon,
                                    title: "Publish in one click",
                                    body: "Your event goes straight onto the board.",
                                },
                                {
                                    Icon: UsersIcon,
                                    title: "Know who's coming",
                                    body: "See registrations against capacity at a glance.",
                                },
                            ].map(({ Icon, title, body }) => (
                                <li
                                    key={title}
                                    className="flex gap-4 rounded-2xl border-2 border-card/15 bg-[#221e18] p-5"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card text-ink">
                                        <Icon size={20} />
                                    </span>
                                    <span>
                                        <span className="block font-display text-lg font-bold">
                                            {title}
                                        </span>
                                        <span className="mt-0.5 block text-sm leading-6 text-card/70">
                                            {body}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t-2 border-ink">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <Brand />
                    <p className="font-mono text-xs uppercase tracking-[0.16em]">
                        © {new Date().getFullYear()} · Made on campus
                    </p>
                    <div className="flex gap-2">
                        <Link href="/login" className="btn btn-ghost btn-sm">
                            Sign in
                        </Link>
                        <Link href="/register" className="btn btn-ghost btn-sm">
                            Create account
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}
